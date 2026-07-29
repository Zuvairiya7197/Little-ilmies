import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { savePreviewPages } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB per page
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const attachedPreviewSchema = z.object({
  productId: z.string().min(1),
  pathnames: z.array(z.string().min(1)).min(1).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const parsed = attachedPreviewSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid uploaded preview data" }, { status: 400 });
      }

      const { productId, pathnames } = parsed.data;
      if (
        pathnames.some(
          (pathname) =>
            !pathname.startsWith(`previews/${productId}/`) || !/\.(jpe?g|png|webp)$/i.test(pathname)
        )
      ) {
        return NextResponse.json({ error: "Invalid uploaded preview path" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, slug: true } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      await prisma.product.update({ where: { id: productId }, data: { previewImagePaths: pathnames } });
      revalidateCatalogPaths(product.slug);
      return NextResponse.json({
        previewImagePaths: pathnames.map((_, index) => `/api/product-assets/previews/${productId}/${index}`),
      });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const productId = formData.get("productId");

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
        return NextResponse.json({ error: `Page ${i + 1} is too large (max 5MB)` }, { status: 413 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Page ${i + 1} has an unsupported image type. Please upload JPG, PNG, or WebP.` },
          { status: 415 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      buffers.push(buffer);
    }

    if (buffers.length === 0) {
      return NextResponse.json({ error: "No valid preview images were uploaded" }, { status: 400 });
    }

    const storedPaths = await savePreviewPages(buffers, product.slug);
    const previewImagePaths = storedPaths.map((_, index) => `/api/product-assets/previews/${productId}/${index}`);

    await prisma.product.update({ where: { id: productId }, data: { previewImagePaths: storedPaths } });
    revalidateCatalogPaths(product.slug);

    return NextResponse.json({ previewImagePaths });
  } catch (error) {
    console.error("Preview upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Preview upload failed: ${error.message}` : "Preview upload failed." },
      { status: 500 }
    );
  }
}
