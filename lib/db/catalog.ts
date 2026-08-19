import { prisma } from "@/lib/db/prisma";
import type {
  AgeRange,
  BundleSummary,
  Category,
  Language,
  ProductDetail,
  ProductFormat,
  ProductSummary,
} from "@/types/catalog";
import type { CurrencyCode } from "@/types/pricing";
import { Prisma } from "@prisma/client";
import { defaultExtra, detailExtras } from "@/data/product-details";
import { productCoverUrl, productPreviewUrls } from "@/lib/catalog-assets";

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { prices: true, categories: { include: { category: true } } },
});

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

function toProductSummary(product: ProductWithRelations): ProductSummary {
  const primaryCategory = product.categories[0]?.category;
  const categories = product.categories.map(({ category }) => ({
    slug: category.slug,
    name: category.name,
  }));
  const extra = detailExtras[product.slug] ?? defaultExtra(product.title);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    author: product.author ?? undefined,
    sku: product.sku ?? undefined,
    shortDescription: product.shortDescription,
    coverImage: productCoverUrl(product.id, product.coverImage),
    prices: product.prices
      .filter((p) => p.isActive)
      .map((p) => ({
        currencyCode: p.currencyCode as CurrencyCode,
        regularPrice: p.regularPrice,
        salePrice: p.salePrice ?? undefined,
        saleStartDate: p.saleStartDate?.toISOString(),
        saleEndDate: p.saleEndDate?.toISOString(),
        isDefault: p.isDefault,
        isActive: p.isActive,
      })),
    category: primaryCategory
      ? { slug: primaryCategory.slug, name: primaryCategory.name }
      : { slug: product.slug, name: product.title },
    categories,
    categorySlugs: categories.map((category) => category.slug),
    ageRange: product.ageRange as AgeRange,
    pageCount: product.pageCount,
    language: product.language as Language,
    format: product.format as ProductFormat,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isBestseller: product.isBestseller,
    isNewArrival: product.isNewArrival,
    isFeatured: product.isFeatured,
    displayOrder: product.displayOrder ?? undefined,
    hasFreePreview: product.hasFreePreview,
    previewImages:
      product.previewImagePaths.length > 0
        ? productPreviewUrls(product.id, product.previewImagePaths)
        : extra.previewImages,
    tags: product.tags,
    usageLicense: product.usageLicense,
    licenseInfo: product.licenseInfo ?? undefined,
    baseCurrency: product.baseCurrency as CurrencyCode,
    productVersion: product.productVersion ?? undefined,
    seoTitle: product.seoTitle ?? undefined,
    seoDescription: product.seoDescription ?? undefined,
    seoKeywords: product.seoKeywords,
    downloadCount: product.downloadCount,
    publishedAt: (product.publishedAt ?? product.createdAt).toISOString(),
  };
}

export async function getPublishedProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null },
    orderBy: { publishedAt: "desc" },
    ...productWithRelations,
  });
  return products.map(toProductSummary);
}

export async function getPublishedProductBySlug(slug: string): Promise<ProductSummary | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    ...productWithRelations,
  });
  return product ? toProductSummary(product) : null;
}

export async function getRelatedProducts(
  product: Pick<ProductSummary, "id" | "category" | "categorySlugs">,
  limit = 4
): Promise<ProductSummary[]> {
  const categorySlugs = product.categorySlugs?.length ? product.categorySlugs : [product.category.slug];
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      archivedAt: null,
      id: { not: product.id },
      categories: { some: { category: { slug: { in: categorySlugs } } } },
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    ...productWithRelations,
  });
  return products.map(toProductSummary);
}

export async function getPublishedProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    ...productWithRelations,
  });
  if (!product) return null;

  const summary = toProductSummary(product);
  const extra = detailExtras[slug] ?? defaultExtra(product.title);
  const related = await getRelatedProducts(summary, 4);

  return {
    ...summary,
    description: product.description ?? extra.description,
    whatsInside: product.whatsIncluded.length > 0 ? product.whatsIncluded : extra.whatsInside,
    learningBenefits: product.learningObjectives.length > 0 ? product.learningObjectives : extra.learningBenefits,
    bestFor: product.suitableFor.length > 0 ? product.suitableFor : extra.bestFor,
    previewImages: summary.previewImages ?? extra.previewImages,
    reviews: extra.reviews,
    relatedSlugs: related.map((p) => p.slug),
  };
}

export async function getRelatedProductsBySlug(slug: string, limit = 4): Promise<ProductSummary[]> {
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    ...productWithRelations,
  });
  if (!product) return [];
  return getRelatedProducts(toProductSummary(product), limit);
}

export async function getAllPublishedProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}

/**
 * The one product an admin has flagged to feature in the homepage
 * "See before you buy" flip-through showcase. Only real, uploaded preview
 * page images are used — never the static placeholder fallback from
 * data/product-details.ts, since showing a stand-in book as "the sample"
 * would misrepresent which book you can actually flip through.
 */
export async function getHomepageSampleProduct(): Promise<{
  slug: string;
  title: string;
  coverImage: string;
  pageCount: number;
  previewImages: string[];
} | null> {
  const product = await prisma.product.findFirst({
    where: { status: "PUBLISHED", archivedAt: null, isHomepageSample: true },
    select: { id: true, slug: true, title: true, coverImage: true, pageCount: true, previewImagePaths: true },
  });

  if (!product || product.previewImagePaths.length === 0) return null;

  return {
    slug: product.slug,
    title: product.title,
    coverImage: productCoverUrl(product.id, product.coverImage),
    pageCount: product.pageCount,
    previewImages: productPreviewUrls(product.id, product.previewImagePaths),
  };
}

export async function getProductsByAgeRange(ageRange: AgeRange, limit = 8): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null, ageRange },
    orderBy: { publishedAt: "desc" },
    take: limit,
    ...productWithRelations,
  });
  return products.map(toProductSummary);
}

export async function getActiveBundles(): Promise<BundleSummary[]> {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { products: { include: { product: productWithRelations } } },
  });

  return bundles.map((bundle) => ({
    id: bundle.id,
    slug: bundle.slug,
    name: bundle.name,
    description: bundle.description ?? undefined,
    coverImage: bundle.coverImage ?? undefined,
    products: bundle.products.filter((bp) => !bp.product.archivedAt).map((bp) => toProductSummary(bp.product)),
    prices: [
      ...(bundle.bundlePriceInr != null
        ? [{ currencyCode: "INR" as CurrencyCode, regularPrice: bundle.bundlePriceInr, isActive: true }]
        : []),
      ...(bundle.bundlePriceUsd != null
        ? [
            {
              currencyCode: "USD" as CurrencyCode,
              regularPrice: bundle.bundlePriceUsd,
              isDefault: true,
              isActive: true,
            },
          ]
        : []),
    ],
  }));
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
