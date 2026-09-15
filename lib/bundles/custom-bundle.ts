import { prisma } from "@/lib/db/prisma";
import type { CurrencyCode } from "@/types/pricing";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { calculateCustomBundlePrice } from "@/lib/pricing/automatic-pricing";
import { getPricingSettings } from "@/lib/settings/pricing-settings";

export type CustomBundleValidationResult = {
  bundleId: string;
  bundleName: string;
  quantity: number;
  unitPrice: number;
  selectedProducts: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    prices: {
      currencyCode: CurrencyCode;
      regularPrice: number;
      salePrice?: number;
      saleStartDate?: string;
      saleEndDate?: string;
      isDefault?: boolean;
      isActive?: boolean;
    }[];
  }[];
};

export async function validateCustomBundleSelection({
  bundleId,
  quantity,
  selectedProductIds,
  currency,
}: {
  bundleId: string;
  quantity: number;
  selectedProductIds: string[];
  currency: CurrencyCode;
}): Promise<CustomBundleValidationResult> {
  if (quantity <= 0) throw new Error("Invalid bundle quantity");
  if (selectedProductIds.length !== quantity) throw new Error("Select the exact number of books");

  const uniqueSelectedIds = new Set(selectedProductIds);
  if (uniqueSelectedIds.size !== selectedProductIds.length) throw new Error("Duplicate books are not allowed");

  const bundle = await prisma.bundle.findFirst({
    where: { id: bundleId, isActive: true, type: "CUSTOM" },
    include: {
      products: { select: { productId: true } },
      customPrices: { where: { quantity, enabled: true } },
    },
  });
  if (!bundle) throw new Error("Bundle is unavailable");

  if (bundle.customPrices.length === 0) throw new Error("This bundle size is not available");

  const eligibleIds = new Set(bundle.products.map((product) => product.productId));
  if (quantity > eligibleIds.size) throw new Error("Bundle size exceeds eligible books");
  for (const productId of selectedProductIds) {
    if (!eligibleIds.has(productId)) throw new Error("One or more selected books are not eligible");
  }

  const selectedProducts = await prisma.product.findMany({
    where: { id: { in: selectedProductIds }, status: "PUBLISHED", archivedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      prices: true,
    },
  });
  if (selectedProducts.length !== selectedProductIds.length) throw new Error("One or more selected books are unavailable");

  const selectedById = new Map(selectedProducts.map((product) => [product.id, product]));
  const orderedProducts = selectedProductIds.map((productId) => selectedById.get(productId)!);
  const regularPrices = orderedProducts.map((product) =>
    resolveProductPrice(
      {
        prices: product.prices.map((price) => ({
          currencyCode: price.currencyCode as CurrencyCode,
          regularPrice: price.regularPrice,
          salePrice: price.salePrice ?? undefined,
          saleStartDate: price.saleStartDate?.toISOString(),
          saleEndDate: price.saleEndDate?.toISOString(),
          isDefault: price.isDefault,
          isActive: price.isActive,
        })),
      },
      currency
    ).regularPrice
  );
  const price = calculateCustomBundlePrice(regularPrices, settings.customBundleDiscountPercentage);

  return {
    bundleId: bundle.id,
    bundleName: bundle.name,
    quantity,
    unitPrice: price.salePrice,
    selectedProducts: orderedProducts.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
      prices: product.prices.map((price) => ({
        currencyCode: price.currencyCode as CurrencyCode,
        regularPrice: price.regularPrice,
        salePrice: price.salePrice ?? undefined,
        saleStartDate: price.saleStartDate?.toISOString(),
        saleEndDate: price.saleEndDate?.toISOString(),
        isDefault: price.isDefault,
        isActive: price.isActive,
      })),
    })),
  };
}
  const settings = await getPricingSettings();
