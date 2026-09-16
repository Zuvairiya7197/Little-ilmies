import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteRentalPages, saveRentalPages } from "@/lib/storage";
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

const MAX_SIZE = 30 * 1024 * 1024; // 30MB per page, pre-compression

const attachedRentalPagesSchema = z.object({
  productId: z.string().min(1),
  pathnames: z.array(z.string().min(1)).min(1).max(500),
});
const removeRentalPagesSchema = z.object({ productId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const parsed = attachedRentalPagesSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid uploaded rental page data" }, { status: 400 });
      }

      const { productId, pathnames } = parsed.data;
      if (
        pathnames.some(
          (pathname) =>
            !pathname.startsWith(`rentals/${productId}/`) || !/\.(jpe?g|png|webp)$/i.test(pathname)
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
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const productId = formData.get("productId");
    // Each page is uploaded in its own request (see uploadRentalPages in
    // product-form.tsx) to stay well under Vercel's serverless request
    // body-size limit regardless of how many pages a book has, so by
    // default a successful upload here appends to the product's existing
    // pages rather than replacing them. Pass append=false to replace
    // instead (used when starting a fresh set of pages).
    const append = formData.get("append") !== "false";

    if (files.length === 0 || typeof productId !== "string") {
      return NextResponse.json({ error: "Missing files or productId" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const buffers: Buffer[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!(file instanceof File)) continue;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `Page ${i + 1} is too large (max 30MB)` }, { status: 413 });
      }
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        return NextResponse.json(
          { error: `Page ${i + 1} has an unsupported image type. Please upload JPG, PNG, or WebP.` },
          { status: 415 }
        );
      }

      let buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.byteLength > COMPRESS_ABOVE_BYTES) {
        try {
          buffer = await sharp(buffer)
            .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();
        } catch (error) {
          console.error(`Rental page ${i + 1} compression failed, storing original`, error);
        }
      }
      buffers.push(buffer);
    }

    if (buffers.length === 0) {
      return NextResponse.json({ error: "No valid rental page images were uploaded" }, { status: 400 });
    }

    const newPaths = await saveRentalPages(buffers, product.slug);
    const storedPaths = append ? [...product.rentalPageImagePaths, ...newPaths] : newPaths;
    const rentalPageImagePaths = productRentalPageUrls(productId, storedPaths);

    await prisma.product.update({ where: { id: productId }, data: { rentalPageImagePaths: storedPaths } });
    if (!append) {
      await deleteRentalPages(product.rentalPageImagePaths);
    }
    revalidateCatalogPaths(product.slug);

    return NextResponse.json({ rentalPageImagePaths });
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
