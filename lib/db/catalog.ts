import { prisma } from "@/lib/db/prisma";
import type { AgeRange, Category, Language, ProductDetail, ProductFormat, ProductSummary } from "@/types/catalog";
import type { CurrencyCode } from "@/types/pricing";
import { Prisma } from "@prisma/client";
import { defaultExtra, detailExtras } from "@/data/product-details";

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { prices: true, categories: { include: { category: true } } },
});

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

function toProductSummary(product: ProductWithRelations): ProductSummary {
  const primaryCategory = product.categories[0]?.category;

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    coverImage: product.coverImage,
    prices: product.prices
      .filter((p) => p.isActive)
      .map((p) => ({
        currencyCode: p.currencyCode as CurrencyCode,
        regularPrice: p.regularPrice,
        salePrice: p.salePrice ?? undefined,
        isDefault: p.isDefault,
        isActive: p.isActive,
      })),
    category: primaryCategory
      ? { slug: primaryCategory.slug, name: primaryCategory.name }
      : { slug: product.slug, name: product.title },
    ageRange: product.ageRange as AgeRange,
    pageCount: product.pageCount,
    language: product.language as Language,
    format: product.format as ProductFormat,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isBestseller: product.isBestseller,
    isNewArrival: product.isNewArrival,
    hasFreePreview: product.hasFreePreview,
    downloadCount: product.downloadCount,
    publishedAt: (product.publishedAt ?? product.createdAt).toISOString(),
  };
}

export async function getPublishedProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    ...productWithRelations,
  });
  return products.map(toProductSummary);
}

export async function getPublishedProductBySlug(slug: string): Promise<ProductSummary | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    ...productWithRelations,
  });
  return product ? toProductSummary(product) : null;
}

export async function getRelatedProducts(
  product: Pick<ProductSummary, "id" | "category">,
  limit = 4
): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: product.id },
      categories: { some: { category: { slug: product.category.slug } } },
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    ...productWithRelations,
  });
  return products.map(toProductSummary);
}

export async function getPublishedProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    ...productWithRelations,
  });
  if (!product) return null;

  const summary = toProductSummary(product);
  const extra = detailExtras[slug] ?? defaultExtra(product.title);
  const related = await getRelatedProducts(summary, 4);

  return {
    ...summary,
    description: product.description ?? extra.description,
    whatsInside: extra.whatsInside,
    learningBenefits: extra.learningBenefits,
    bestFor: extra.bestFor,
    previewImages: product.previewImagePaths.length > 0 ? product.previewImagePaths : extra.previewImages,
    reviews: extra.reviews,
    relatedSlugs: related.map((p) => p.slug),
  };
}

export async function getRelatedProductsBySlug(slug: string, limit = 4): Promise<ProductSummary[]> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    ...productWithRelations,
  });
  if (!product) return [];
  return getRelatedProducts(toProductSummary(product), limit);
}

export async function getAllPublishedProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}

export async function getAllCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
    coverImage: c.coverImage ?? "/images/categories/placeholder.svg",
    bookCount: c._count.products,
  }));
}
