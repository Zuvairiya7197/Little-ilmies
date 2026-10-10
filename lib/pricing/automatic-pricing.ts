import {
  DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE,
  DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE,
} from "@/lib/settings/pricing-settings";
import type { CurrencyCode } from "@/types/pricing";

export const BOOK_SALE_DISCOUNT_PERCENTAGE = DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE;
export const CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE = DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE;

/**
 * Rounds a discounted minor-unit amount DOWN to the nearest "charm" price,
 * so every discounted book and bundle shows a clean, attractive figure and
 * the buyer always saves at least the advertised percentage:
 *   INR  → whole rupees ending in 9 (₹168 → ₹159, ₹762 → ₹759; ₹1,000+
 *          ends in 49/99, e.g. ₹1,270 → ₹1,249)
 *   other → ends in .49 / .99 (e.g. $8.48 → $7.99, AED 18.35 → AED 17.99)
 * Falls back to the plain amount when it is too small to round.
 */
function roundToCharmPrice(minorUnits: number, currencyCode?: CurrencyCode) {
  if (currencyCode === "INR") {
    const rupees = Math.floor(minorUnits / 100);
    const step = rupees >= 1000 ? 50 : 10;
    const charm = Math.floor((rupees + 1) / step) * step - 1;
    return (charm > 0 ? charm : Math.max(rupees, 1)) * 100;
  }

  const charm = Math.floor((minorUnits + 1) / 50) * 50 - 1;
  return charm > 0 ? charm : minorUnits;
}

export function calculateSalePrice(
  regularPrice: number,
  discountPercentage: number,
  currencyCode?: CurrencyCode
) {
  if (discountPercentage <= 0) return regularPrice;
  const raw = Math.round((regularPrice * (100 - discountPercentage)) / 100);
  return roundToCharmPrice(raw, currencyCode);
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
