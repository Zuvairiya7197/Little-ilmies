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

  await prisma.category.update({ where: { id: categoryId }, data: parsed.data });
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
