import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  deletePreviewPages,
  deleteRentalPages,
  getPrivatePdf,
  savePreviewPages,
  saveRentalPages,
} from "@/lib/storage";
import { rasterizePdfPage } from "@/lib/pdf-rasterize";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { productPreviewUrls, productRentalPageUrls } from "@/lib/catalog-assets";
import { z } from "zod";

// Higher than the 85/2400 defaults used for re-compressing manually
// uploaded rental pages (upload-rental-pages/route.ts): those exist to
// shrink whatever an admin happened to upload, but here we control the
// entire render pipeline, so quality 95 keeps generated pages visually
// indistinguishable from the source PDF (no perceptible JPEG artifacting)
// while still compressing meaningfully versus PNG. 3000px keeps text
// crisp even if a reader zooms in past 100%.
const JPEG_QUALITY = 95;
const MAX_DIMENSION = 3000;

const requestSchema = z.object({
  productId: z.string().min(1),
  pageNumber: z.number().int().min(1),
  target: z.enum(["preview", "rental"]),
  // Set by the UI on the first call of a fresh "Generate from PDF" run —
  // clears any existing pages for that target first, same semantics as
  // the manual upload routes' "replace" behavior, so re-running generation
  // doesn't just keep appending onto old pages.
  append: z.boolean().default(true),
});

/**
 * Renders a single page of the product's already-uploaded PDF to a
 * compressed JPEG and appends it to previewImagePaths or
 * rentalPageImagePaths, via the same storage functions the manual upload
 * routes use — generated pages are indistinguishable from hand-uploaded
 * ones to every other route (reorder, remove, copy-to-preview, dedupe).
 *
 * Deliberately one page per request: a book can have up to 500 pages, and
 * this repo has no maxDuration override, so an all-pages-at-once call
 * risks the default serverless timeout. The admin UI loops this call
 * page-by-page instead.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { productId, pageNumber, target, append } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        slug: true,
        privatePdfPath: true,
        previewImagePaths: true,
        rentalPageImagePaths: true,
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!product.privatePdfPath) {
      return NextResponse.json({ error: "This product has no PDF uploaded yet" }, { status: 422 });
    }

    let rendered: Buffer;
    try {
      const pdfBuffer = await getPrivatePdf(product.privatePdfPath);
      const png = await rasterizePdfPage(pdfBuffer, pageNumber, MAX_DIMENSION);
      rendered = await sharp(png).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    } catch (error) {
      console.error(`Rasterizing page ${pageNumber} for product ${productId} failed`, error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Could not render page ${pageNumber}: ${error.message}`
              : `Could not render page ${pageNumber}.`,
        },
        { status: 422 }
      );
    }

    if (target === "preview") {
      if (!append) {
        await deletePreviewPages(product.previewImagePaths);
      }
      const existing = append ? product.previewImagePaths : [];
      const [newPath] = await savePreviewPages([rendered], product.slug);
      const storedPaths = [...existing, newPath];
      await prisma.product.update({ where: { id: productId }, data: { previewImagePaths: storedPaths } });
      revalidateCatalogPaths(product.slug);
      return NextResponse.json({ previewImagePaths: productPreviewUrls(productId, storedPaths) });
    }

    if (!append) {
      await deleteRentalPages(product.rentalPageImagePaths);
    }
    const existing = append ? product.rentalPageImagePaths : [];
    const [newPath] = await saveRentalPages([rendered], product.slug);
    const storedPaths = [...existing, newPath];
    await prisma.product.update({ where: { id: productId }, data: { rentalPageImagePaths: storedPaths } });
    revalidateCatalogPaths(product.slug);
    return NextResponse.json({ rentalPageImagePaths: productRentalPageUrls(productId, storedPaths) });
  } catch (error) {
    console.error("Generating page from PDF failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Page generation failed: ${error.message}` : "Page generation failed." },
      { status: 500 }
    );
  }
}
