import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { categoryFormSchema } from "@/lib/validation/admin-category";

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { categoryId } = await params;
  const parsed = categoryFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
  }

  const existingWithSlug = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existingWithSlug && existingWithSlug.id !== categoryId) {
    return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
  }

  if (parsed.data.parentId) {
    if (parsed.data.parentId === categoryId) {
      return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
    }
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent) {
      return NextResponse.json({ error: "Selected parent category does not exist" }, { status: 400 });
    }
    if (parent.parentId) {
      return NextResponse.json({ error: "Cannot nest a category under a child category" }, { status: 400 });
    }
    // If this category already has children, it can't also become a
    // child itself — that would make the hierarchy more than two levels
    // deep, which nothing in the storefront/admin UI expects.
    const childCount = await prisma.category.count({ where: { parentId: categoryId } });
    if (childCount > 0) {
      return NextResponse.json(
        { error: "This category has its own child categories — remove or reassign them before giving it a parent." },
        { status: 400 }
      );
    }
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      parentId: parsed.data.parentId ?? null,
      isFeaturedOnHomepage: parsed.data.isFeaturedOnHomepage ?? false,
      displayOrder: parsed.data.displayOrder ?? 0,
      iconKey: parsed.data.iconKey ?? null,
      accentColor: parsed.data.accentColor ?? null,
    },
  });
  return NextResponse.json({ id: categoryId });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { categoryId } = await params;
  const productCount = await prisma.productCategory.count({ where: { categoryId } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${productCount} product(s) still use this category.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
  return NextResponse.json({ status: "deleted" });
}
