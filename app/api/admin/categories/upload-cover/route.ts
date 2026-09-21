import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteCoverImage, saveCoverImage } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { categoryCoverUrl } from "@/lib/catalog-assets";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get("file");
    const categoryId = formData.get("categoryId");

    if (!(file instanceof File) || typeof categoryId !== "string") {
      return NextResponse.json({ error: "Missing file or categoryId" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Please upload JPG, PNG, WebP, or SVG." },
        { status: 415 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true, coverImage: true },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category was saved, but the cover could not be attached because the category was not found." },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativePath = await saveCoverImage(buffer, file.name);

    await prisma.category.update({ where: { id: categoryId }, data: { coverImage: relativePath } });
    if (category.coverImage && category.coverImage !== relativePath) {
      await deleteCoverImage(category.coverImage);
    }
    revalidateCatalogPaths();

    return NextResponse.json({ coverImage: categoryCoverUrl(categoryId, relativePath) });
  } catch (error) {
    console.error("Category cover upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Cover upload failed: ${error.message}` : "Cover upload failed." },
      { status: 500 }
    );
  }
}
