import { prisma } from "@/lib/db/prisma";
import type { CurrencyCode } from "@/types/pricing";

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
      customPrices: { where: { quantity, currencyCode: currency, enabled: true } },
    },
  });
  if (!bundle) throw new Error("Bundle is unavailable");

  const price = bundle.customPrices[0];
  if (!price || price.price < 0) throw new Error(`This bundle size is not available in ${currency}`);

  const eligibleIds = new Set(bundle.products.map((product) => product.productId));
  if (quantity > eligibleIds.size) throw new Error("Bundle size exceeds eligible books");
  for (const productId of selectedProductIds) {
    if (!eligibleIds.has(productId)) throw new Error("One or more selected books are not eligible");
  }

  const selectedProducts = await prisma.product.findMany({
    where: { id: { in: selectedProductIds }, status: "PUBLISHED", archivedAt: null },
    select: { id: true, slug: true, title: true, coverImage: true },
  });
  if (selectedProducts.length !== selectedProductIds.length) throw new Error("One or more selected books are unavailable");

  const selectedById = new Map(selectedProducts.map((product) => [product.id, product]));
  return {
    bundleId: bundle.id,
    bundleName: bundle.name,
    quantity,
    unitPrice: price.price,
    selectedProducts: selectedProductIds.map((productId) => selectedById.get(productId)!),
  };
}
