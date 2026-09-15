import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deletePreviewPages, getPreviewPages, getRentalPage } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { z } from "zod";

const dedupeSchema = z.object({ productId: z.string().min(1) });

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Deletes a product's public preview page files when every one of them is
 * a byte-for-byte duplicate of a private rental page — the redundant
 * upload this cleanup targets. Re-verifies the match itself rather than
 * trusting anything the client claims, since this deletes files.
 * previewImagePaths is cleared (not repointed at rental storage — preview
 * stays a distinct public asset); use "Use these pages as free preview"
 * on the product page afterwards to republish from rental pages if
 * still wanted.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = dedupeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true, slug: true, previewImagePaths: true, rentalPageImagePaths: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.previewImagePaths.length === 0 || product.rentalPageImagePaths.length === 0) {
      return NextResponse.json({ error: "Nothing to deduplicate for this product" }, { status: 422 });
    }

    const [previewBuffers, rentalBuffers] = await Promise.all([
      getPreviewPages(product.previewImagePaths),
      Promise.all(product.rentalPageImagePaths.map((path) => getRentalPage(path))),
    ]);
    const rentalHashes = new Set(rentalBuffers.map(sha256));
    const allDuplicated = previewBuffers.every((buffer) => rentalHashes.has(sha256(buffer)));

    if (!allDuplicated) {
      return NextResponse.json(
        { error: "Preview pages no longer match rental pages exactly — refusing to delete." },
        { status: 409 }
      );
    }

    await deletePreviewPages(product.previewImagePaths);
    await prisma.product.update({ where: { id: product.id }, data: { previewImagePaths: [] } });
    revalidateCatalogPaths(product.slug);

    return NextResponse.json({ status: "removed", removedCount: product.previewImagePaths.length });
  } catch (error) {
    console.error("Deduplicating preview pages failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Could not deduplicate: ${error.message}` : "Could not deduplicate." },
      { status: 500 }
    );
  }
}
