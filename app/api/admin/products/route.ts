import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { productFormSchema } from "@/lib/validation/admin-product";

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = productFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  }
  const { categoryIds, prices, ...productData } = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      ...productData,
      coverImage: "/images/products/placeholder.svg",
      previewImagePaths: [],
      publishedAt: productData.status === "PUBLISHED" ? new Date() : null,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      prices: {
        create: prices.map((p) => ({
          currencyCode: p.currencyCode,
          pricingRegion: p.currencyCode === "INR" ? "India" : "International",
          regularPrice: Math.round(p.regularPrice * 100),
          salePrice: p.salePrice ? Math.round(p.salePrice * 100) : undefined,
          isDefault: p.currencyCode === "USD",
          isActive: p.isActive,
        })),
      },
    },
  });

  return NextResponse.json({ id: product.id, slug: product.slug }, { status: 201 });
}
