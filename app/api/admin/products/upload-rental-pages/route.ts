import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteRentalPages, getRentalPage, putRentalPage } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { productRentalPageUrls } from "@/lib/catalog-assets";
import { z } from "zod";

// Raw scans/exports from admins commonly arrive far larger than a screen
// can even display (15-30MB+ isn't unusual). Re-encoding to JPEG at this
// quality is visually lossless for book-page content (text/illustrations)
// while typically cutting file size by 90%+ — keeps the rental reader
// fast on mobile without the admin having to compress anything by hand.
// Only re-encodes if the source is actually larger than the cap below;
// small, already-optimized images pass through untouched.
const COMPRESS_ABOVE_BYTES = 1.5 * 1024 * 1024; // 1.5MB
const JPEG_QUALITY = 85;
const MAX_DIMENSION = 2400; // px on the longest side — plenty for any screen

const attachedRentalPagesSchema = z.object({
  productId: z.string().min(1),
  pathnames: z.array(z.string().min(1)).min(1).max(500),
});
const removeRentalPagesSchema = z.object({ productId: z.string().min(1) });
// Reorders the existing pages in place — same set of keys, just a new
// order, so (unlike attachedRentalPagesSchema below) nothing gets deleted
// from storage.
const reorderRentalPagesSchema = z.object({
  productId: z.string().min(1),
  order: z.array(z.string().min(1)).min(1).max(500),
});
// Finalizes a single page already uploaded directly to B2 via the
// presigned client-upload flow: compresses it in place and attaches (or
// appends) its path to the product. Bytes never pass through this route
// as a request body — only downloaded from/re-uploaded to B2 server-side
// (an outbound call, not subject to Vercel's inbound request body-size
// limit), which is what lets a 15-30MB raw scan work at all.
const finalizeRentalPageSchema = z.object({
  productId: z.string().min(1),
  key: z.string().min(1),
  append: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const body = await request.json();

    if ("key" in body) {
      const parsed = finalizeRentalPageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid finalize request" }, { status: 400 });
      }
      const { productId, key, append } = parsed.data;

      if (!key.startsWith(`rentals/${productId}/`) || !/\.(jpe?g|png|webp)$/i.test(key)) {
        return NextResponse.json({ error: "Invalid uploaded rental page path" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, slug: true, rentalPageImagePaths: true },
      });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      let buffer: Buffer;
      try {
        buffer = await getRentalPage(key);
      } catch {
        return NextResponse.json({ error: "Could not find the uploaded page — try uploading again." }, { status: 404 });
      }

      if (buffer.byteLength > COMPRESS_ABOVE_BYTES) {
        try {
          const compressed = await sharp(buffer)
            .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();
          await putRentalPage(key, compressed);
        } catch (error) {
          console.error(`Rental page compression failed for ${key}, keeping original`, error);
        }
      }

      const previousPaths = append ? product.rentalPageImagePaths : [];
      // Replacing (append: false) on the first page of a new set clears
      // out whatever was there before, so old pages don't linger under
      // the new ones.
      if (!append) {
        await deleteRentalPages(product.rentalPageImagePaths);
      }
      const storedPaths = [...previousPaths, key];

      await prisma.product.update({ where: { id: productId }, data: { rentalPageImagePaths: storedPaths } });
      revalidateCatalogPaths(product.slug);

      return NextResponse.json({ rentalPageImagePaths: productRentalPageUrls(productId, storedPaths) });
    }

    if ("order" in body) {
      const parsed = reorderRentalPagesSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid reorder request" }, { status: 400 });
      }
      const { productId, order } = parsed.data;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, slug: true, rentalPageImagePaths: true },
      });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const current = new Set(product.rentalPageImagePaths);
      const isSamePages = order.length === current.size && order.every((p) => current.has(p));
      if (!isSamePages) {
        return NextResponse.json({ error: "Reorder must include exactly the current set of pages." }, { status: 400 });
      }

      await prisma.product.update({ where: { id: productId }, data: { rentalPageImagePaths: order } });
      revalidateCatalogPaths(product.slug);
      return NextResponse.json({ rentalPageImagePaths: productRentalPageUrls(productId, order) });
    }

    const parsed = attachedRentalPagesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid uploaded rental page data" }, { status: 400 });
    }

    const { productId, pathnames } = parsed.data;
    if (
      pathnames.some(
        (pathname) => !pathname.startsWith(`rentals/${productId}/`) || !/\.(jpe?g|png|webp)$/i.test(pathname)
      )
    ) {
      return NextResponse.json({ error: "Invalid uploaded rental page path" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, rentalPageImagePaths: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.update({ where: { id: productId }, data: { rentalPageImagePaths: pathnames } });
    await deleteRentalPages(product.rentalPageImagePaths);
    revalidateCatalogPaths(product.slug);
    return NextResponse.json({
      rentalPageImagePaths: productRentalPageUrls(productId, pathnames),
    });
  } catch (error) {
    console.error("Rental page upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Rental page upload failed: ${error.message}` : "Rental page upload failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = removeRentalPagesSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true, slug: true, rentalPageImagePaths: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await deleteRentalPages(product.rentalPageImagePaths);
    await prisma.product.update({ where: { id: product.id }, data: { rentalPageImagePaths: [] } });
    revalidateCatalogPaths(product.slug);
    return NextResponse.json({ status: "removed" });
  } catch (error) {
    console.error("Rental page removal failed", error);
    return NextResponse.json({ error: "Rental page removal failed." }, { status: 500 });
  }
}
