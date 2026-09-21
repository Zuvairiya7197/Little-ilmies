import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { categoryFormSchema } from "@/lib/validation/admin-category";

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = categoryFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
  }

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent) {
      return NextResponse.json({ error: "Selected parent category does not exist" }, { status: 400 });
    }
    // Keep the hierarchy two levels deep: a category that already has a
    // parent can't itself be picked as someone else's parent.
    if (parent.parentId) {
      return NextResponse.json({ error: "Cannot nest a category under a child category" }, { status: 400 });
    }
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      coverImage: "/images/categories/placeholder.svg",
      parentId: parsed.data.parentId ?? null,
      isFeaturedOnHomepage: parsed.data.isFeaturedOnHomepage ?? false,
      displayOrder: parsed.data.displayOrder ?? 0,
      iconKey: parsed.data.iconKey ?? null,
      accentColor: parsed.data.accentColor ?? null,
    },
  });

  return NextResponse.json({ id: category.id }, { status: 201 });
}
