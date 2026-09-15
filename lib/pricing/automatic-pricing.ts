export const BOOK_SALE_DISCOUNT_PERCENTAGE = 20;
export const CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE = 15;

export function calculateSalePrice(
  regularPrice: number,
  discountPercentage: number
) {
  return Math.round((regularPrice * (100 - discountPercentage)) / 100);
}

export function calculateBookSalePrice(regularPrice: number) {
  return calculateSalePrice(regularPrice, BOOK_SALE_DISCOUNT_PERCENTAGE);
}

export function calculateCustomBundlePrice(regularPrices: number[]) {
  const regularPrice = regularPrices.reduce((sum, price) => sum + price, 0);
  const salePrice = calculateSalePrice(
    regularPrice,
    CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE
  );

  return {
    regularPrice,
    salePrice,
    savings: Math.max(0, regularPrice - salePrice),
  };
}
