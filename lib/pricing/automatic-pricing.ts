import {
  DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE,
  DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE,
} from "@/lib/settings/pricing-settings";

export const BOOK_SALE_DISCOUNT_PERCENTAGE = DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE;
export const CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE = DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE;

export function calculateSalePrice(
  regularPrice: number,
  discountPercentage: number
) {
  return Math.round((regularPrice * (100 - discountPercentage)) / 100);
}

export function calculateBookSalePrice(
  regularPrice: number,
  discountPercentage = BOOK_SALE_DISCOUNT_PERCENTAGE
) {
  return calculateSalePrice(regularPrice, discountPercentage);
}

export function calculateCustomBundlePrice(
  regularPrices: number[],
  discountPercentage = CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE
) {
  const regularPrice = regularPrices.reduce((sum, price) => sum + price, 0);
  const salePrice = calculateSalePrice(
    regularPrice,
    discountPercentage
  );

  return {
    regularPrice,
    salePrice,
    savings: Math.max(0, regularPrice - salePrice),
  };
}
