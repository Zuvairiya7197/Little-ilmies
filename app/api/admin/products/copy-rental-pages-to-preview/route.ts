import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deletePreviewPages, getRentalPage, savePreviewPages } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { productPreviewUrls } from "@/lib/catalog-assets";
import { z } from "zod";

// Deliberately much lower than upload-preview's 20-page ceiling: this
// route publishes previously-private rental pages (which may cover an
// entire book) to the public preview route, so it caps how much of a
// book an admin can expose in one action — a genuine teaser, not the
// whole rental set.
const MAX_PAGES = 8;

const copySchema = z.object({
  productId: z.string().min(1),
  rentalPageIndexes: z.array(z.number().int().min(0)).min(1).max(MAX_PAGES),
});

/**
 * Publishes a hand-picked subset of a book's already-uploaded Rent & Read
 * page images as the public "See before you buy" preview — no re-upload
 * from the browser, and no direct path from the private rentals/ store to
 * a public URL: bytes are read here server-side and re-saved into the
 * previews/ store under a new preview-specific path.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = copySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { productId, rentalPageIndexes } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, rentalPageImagePaths: true, previewImagePaths: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const outOfRange = rentalPageIndexes.filter((i) => i >= product.rentalPageImagePaths.length);
    if (outOfRange.length > 0) {
      return NextResponse.json({ error: "One or more selected pages don't exist" }, { status: 422 });
    }

    const buffers = await Promise.all(
      rentalPageIndexes.map((index) => getRentalPage(product.rentalPageImagePaths[index]))
    );

    const storedPaths = await savePreviewPages(buffers, product.slug);

    await prisma.product.update({ where: { id: productId }, data: { previewImagePaths: storedPaths } });
    await deletePreviewPages(product.previewImagePaths);
    revalidateCatalogPaths(product.slug);

    return NextResponse.json({ previewImagePaths: productPreviewUrls(productId, storedPaths) });
  } catch (error) {
    console.error("Copying rental pages to preview failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Could not use rental pages as preview: ${error.message}`
            : "Could not use rental pages as preview.",
      },
      { status: 500 }
    );
  }
}
