import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { productFormSchema } from "@/lib/validation/admin-product";
import { deletePrivatePdf } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { productId } = await params;
  const parsed = productFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  }
  const { categoryIds, prices, ...productData } = parsed.data;

  const existingWithSlug = await prisma.product.findUnique({ where: { slug: productData.slug } });
  if (existingWithSlug && existingWithSlug.id !== productId) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }
  if (productData.sku) {
    const existingWithSku = await prisma.product.findUnique({ where: { sku: productData.sku } });
    if (existingWithSku && existingWithSku.id !== productId) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
    }
  }

  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // At most one product can be the homepage sample — clear any previous one.
  if (productData.isHomepageSample && !current.isHomepageSample) {
    await prisma.product.updateMany({
      where: { isHomepageSample: true },
      data: { isHomepageSample: false },
    });
  }

  await prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { productId } }),
    prisma.productPrice.updateMany({ where: { productId }, data: { isDefault: false } }),
    prisma.product.update({
      where: { id: productId },
      data: {
        ...productData,
        publishedAt:
          productData.status === "PUBLISHED" && !current.publishedAt ? new Date() : current.publishedAt,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      },
    }),
    ...prices.map((p) =>
      prisma.productPrice.upsert({
        where: { productId_currencyCode: { productId, currencyCode: p.currencyCode } },
        update: {
          regularPrice: Math.round(p.regularPrice * 100),
          salePrice: p.salePrice ? Math.round(p.salePrice * 100) : null,
          saleStartDate: p.saleStartDate ? new Date(p.saleStartDate) : null,
          saleEndDate: p.saleEndDate ? new Date(p.saleEndDate) : null,
          isDefault: p.currencyCode === productData.baseCurrency,
          isActive: p.isActive,
        },
        create: {
          productId,
          currencyCode: p.currencyCode,
          pricingRegion: p.currencyCode === "INR" ? "India" : "International",
          regularPrice: Math.round(p.regularPrice * 100),
          salePrice: p.salePrice ? Math.round(p.salePrice * 100) : undefined,
          saleStartDate: p.saleStartDate ? new Date(p.saleStartDate) : undefined,
          saleEndDate: p.saleEndDate ? new Date(p.saleEndDate) : undefined,
          isDefault: p.currencyCode === productData.baseCurrency,
          isActive: p.isActive,
        },
      })
    ),
  ]);

  revalidateCatalogPaths(current.slug);
  if (current.slug !== productData.slug) {
    revalidateCatalogPaths(productData.slug);
  }

  return NextResponse.json({ id: productId });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    // Preserve order history integrity — unpublish instead of hard-deleting
    // a product that's part of a real purchase record.
    await prisma.product.update({ where: { id: productId }, data: { status: "DRAFT" } });
    revalidateCatalogPaths(product.slug);
    return NextResponse.json({
      status: "unpublished",
      message: "Product has past orders, so it was unpublished instead of deleted.",
    });
  }

  if (product.privatePdfPath) {
    await deletePrivatePdf(product.privatePdfPath);
  }

  await prisma.product.delete({ where: { id: productId } });
  revalidateCatalogPaths(product.slug);
  return NextResponse.json({ status: "deleted" });
}
