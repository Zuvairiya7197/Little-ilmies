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
import { calculateBookSalePrice, calculateCustomBundlePrice } from "@/lib/pricing/automatic-pricing";
import { getPricingSettings, type PricingSettings } from "@/lib/settings/pricing-settings";

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { prices: true, categories: { include: { category: true } } },
});

type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

function toProductSummary(
  product: ProductWithRelations,
  settings: PricingSettings
): ProductSummary {
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
        salePrice: calculateBookSalePrice(p.regularPrice, settings.bookSaleDiscountPercentage, p.currencyCode as CurrencyCode),
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
    rentAndReadEnabled: product.rentAndReadEnabled,
    hasRentalPages: product.rentalPageImagePaths.length > 0,
    previewImages:
      product.previewImagePaths.length > 0
        ? productPreviewUrls(product.id, product.previewImagePaths)
        : extra.previewImages,
    tags: product.tags,
    learningGoals: product.learningGoals,
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

export async function getRentAndReadProducts(limit?: number): Promise<ProductSummary[]> {
  const settings = await getPricingSettings();
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      archivedAt: null,
      rentAndReadEnabled: true,
      rentalPageImagePaths: { isEmpty: false },
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
    ...productWithRelations,
  });

  return products.map((product) => toProductSummary(product, settings));
}

export async function getPublishedProducts(): Promise<ProductSummary[]> {
  const settings = await getPricingSettings();
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null },
    orderBy: { publishedAt: "desc" },
    ...productWithRelations,
  });
  return products.map((product) => toProductSummary(product, settings));
}

export async function getPublishedProductBySlug(slug: string): Promise<ProductSummary | null> {
  const settings = await getPricingSettings();
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    ...productWithRelations,
  });
  return product ? toProductSummary(product, settings) : null;
}

export async function getRelatedProducts(
  product: Pick<ProductSummary, "id" | "category" | "categorySlugs">,
  limit = 4
): Promise<ProductSummary[]> {
  const settings = await getPricingSettings();
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
  return products.map((p) => toProductSummary(p, settings));
}

export async function getPublishedProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const settings = await getPricingSettings();
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    ...productWithRelations,
  });
  if (!product) return null;

  const summary = toProductSummary(product, settings);
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
  const settings = await getPricingSettings();
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    ...productWithRelations,
  });
  if (!product) return [];
  return getRelatedProducts(toProductSummary(product, settings), limit);
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
  const settings = await getPricingSettings();
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", archivedAt: null, ageRange },
    orderBy: { publishedAt: "desc" },
    take: limit,
    ...productWithRelations,
  });
  return products.map((product) => toProductSummary(product, settings));
}

export async function getActiveBundles(): Promise<BundleSummary[]> {
  const settings = await getPricingSettings();
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { products: { include: { product: productWithRelations } }, customPrices: true },
  });

  return bundles.map((bundle) => {
    const products = bundle.products
      .filter((bp) => !bp.product.archivedAt)
      .map((bp) => toProductSummary(bp.product, settings));
    const customPrices = bundle.customPrices.map((price) => {
      const currencyCode = price.currencyCode as CurrencyCode;
      const regularPrices = products.flatMap((product) => {
        const productPrice = product.prices.find((p) => p.currencyCode === currencyCode && p.isActive !== false);
        return productPrice ? [productPrice.regularPrice] : [];
      });
      const sizedPrices = regularPrices.slice(0, price.quantity);
      const computed =
        sizedPrices.length === price.quantity
          ? calculateCustomBundlePrice(sizedPrices, settings.customBundleDiscountPercentage, currencyCode)
          : { salePrice: price.price, regularPrice: price.compareAtPrice ?? price.price };

      return {
        quantity: price.quantity,
        currencyCode,
        price: computed.salePrice,
        compareAtPrice: computed.regularPrice,
        enabled: price.enabled,
      };
    });
    const prices =
      bundle.type === "CUSTOM"
        ? Object.values(
            customPrices
              .filter((price) => price.enabled)
              .reduce<Record<string, { currencyCode: CurrencyCode; regularPrice: number; isDefault?: boolean; isActive: boolean }>>(
                (acc, price) => {
                  const current = acc[price.currencyCode];
                  if (!current || price.price < current.regularPrice) {
                    acc[price.currencyCode] = {
                      currencyCode: price.currencyCode,
                      regularPrice: price.price,
                      isDefault: price.currencyCode === "USD",
                      isActive: true,
                    };
                  }
                  return acc;
                },
                {}
              )
          )
        : [
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
          ];

    return {
      id: bundle.id,
      slug: bundle.slug,
      name: bundle.name,
      description: bundle.description ?? undefined,
      coverImage: bundle.coverImage ?? undefined,
      type: bundle.type,
      products,
      prices,
      customPrices,
      customBundleDiscountPercentage: settings.customBundleDiscountPercentage,
    };
  });
}

export async function getActiveCustomBundleBySlug(slug: string): Promise<BundleSummary | null> {
  const bundles = await getActiveBundles();
  return bundles.find((bundle) => bundle.slug === slug && bundle.type === "CUSTOM") ?? null;
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
