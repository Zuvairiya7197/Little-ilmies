import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { productFormSchema } from "@/lib/validation/admin-product";
import { deletePrivatePdf } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(100),
});

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

  // At most one product can be the homepage sample — clear any previous one.
  if (productData.isHomepageSample) {
    await prisma.product.updateMany({
      where: { isHomepageSample: true },
      data: { isHomepageSample: false },
    });
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

  revalidateCatalogPaths(product.slug);

  return NextResponse.json({ id: product.id, slug: product.slug }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = bulkDeleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Select at least one product to delete." }, { status: 400 });
  }

  const productIds = Array.from(new Set(parsed.data.productIds));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { _count: { select: { orderItems: true } } },
  });

  if (products.length === 0) {
    return NextResponse.json({ error: "No matching products found." }, { status: 404 });
  }

  const productsWithOrders = products.filter((product) => product._count.orderItems > 0);
  const productsToDelete = products.filter((product) => product._count.orderItems === 0);

  if (productsWithOrders.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: productsWithOrders.map((product) => product.id) } },
      data: { status: "DRAFT" },
    });
  }

  for (const product of productsToDelete) {
    if (product.privatePdfPath) {
      await deletePrivatePdf(product.privatePdfPath);
    }
  }

  if (productsToDelete.length > 0) {
    await prisma.product.deleteMany({
      where: { id: { in: productsToDelete.map((product) => product.id) } },
    });
  }

  products.forEach((product) => revalidateCatalogPaths(product.slug));

  return NextResponse.json({
    deletedCount: productsToDelete.length,
    unpublishedCount: productsWithOrders.length,
    missingCount: productIds.length - products.length,
  });
}
