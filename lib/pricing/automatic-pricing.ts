import {
  DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE,
  DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE,
} from "@/lib/settings/pricing-settings";
import type { CurrencyCode } from "@/types/pricing";

export const BOOK_SALE_DISCOUNT_PERCENTAGE = DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE;
export const CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE = DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE;

/**
 * Rounds a minor-unit amount to the nearest whole major unit (100 minor
 * units) — e.g. 15920 (₹159.20) becomes 15900 (₹159). Indian pricing
 * conventionally never shows paise, unlike USD/GBP/AED where cent-level
 * amounts (e.g. $4.99) are normal and expected.
 */
function roundToWholeUnit(minorUnits: number) {
  return Math.round(minorUnits / 100) * 100;
}

export function calculateSalePrice(
  regularPrice: number,
  discountPercentage: number,
  currencyCode?: CurrencyCode
) {
  const raw = Math.round((regularPrice * (100 - discountPercentage)) / 100);
  return currencyCode === "INR" ? roundToWholeUnit(raw) : raw;
}

export function calculateBookSalePrice(
  regularPrice: number,
  discountPercentage = BOOK_SALE_DISCOUNT_PERCENTAGE,
  currencyCode?: CurrencyCode
) {
  return calculateSalePrice(regularPrice, discountPercentage, currencyCode);
}

export function calculateCustomBundlePrice(
  regularPrices: number[],
  discountPercentage = CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE,
  currencyCode?: CurrencyCode
) {
  const regularPrice = regularPrices.reduce((sum, price) => sum + price, 0);
  const salePrice = calculateSalePrice(
    regularPrice,
    discountPercentage,
    currencyCode
  );

  return {
    regularPrice,
    salePrice,
    savings: Math.max(0, regularPrice - salePrice),
  };
}
