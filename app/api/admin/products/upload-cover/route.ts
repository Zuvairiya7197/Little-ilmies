import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteCoverImage, saveCoverImage } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { productCoverUrl } from "@/lib/catalog-assets";
import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const removeCoverSchema = z.object({ productId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get("file");
    const productId = formData.get("productId");

    if (!(file instanceof File) || typeof productId !== "string") {
      return NextResponse.json({ error: "Missing file or productId" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported image type. Please upload JPG, PNG, WebP, or SVG." }, { status: 415 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, coverImage: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product was saved, but the cover could not be attached because the product was not found." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativePath = await saveCoverImage(buffer, file.name);

    await prisma.product.update({ where: { id: productId }, data: { coverImage: relativePath } });
    if (product.coverImage !== relativePath) {
      await deleteCoverImage(product.coverImage);
    }
    revalidateCatalogPaths(product.slug);

    return NextResponse.json({ coverImage: productCoverUrl(productId, relativePath) });
  } catch (error) {
    console.error("Cover upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Cover upload failed: ${error.message}` : "Cover upload failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = removeCoverSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      select: { id: true, slug: true, coverImage: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await deleteCoverImage(product.coverImage);
    await prisma.product.update({
      where: { id: product.id },
      data: { coverImage: "/images/products/placeholder.svg" },
    });
    revalidateCatalogPaths(product.slug);
    return NextResponse.json({ status: "removed" });
  } catch (error) {
    console.error("Cover removal failed", error);
    return NextResponse.json({ error: "Cover removal failed." }, { status: 500 });
  }
}
