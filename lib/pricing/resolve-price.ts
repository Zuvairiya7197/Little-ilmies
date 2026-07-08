import { FALLBACK_CURRENCY, type CurrencyCode } from "@/types/pricing";
import type { ProductSummary } from "@/types/catalog";

export interface ResolvedPrice {
  currencyCode: CurrencyCode;
  regularPrice: number;
  salePrice?: number;
  /** True when we couldn't honor the requested currency and had to fall back. */
  isFallback: boolean;
  /** True only in the last-resort case: no USD price exists either, so we show INR with a warning. */
  isEmergencyFallback: boolean;
}

/**
 * Resolves the price to DISPLAY for a product given a currency. This is
 * used both for the customer-facing display currency (frontend, informational
 * only) and — with a backend-verified region instead of the frontend
 * preference — for the actual checkout amount. The fallback order is the
 * same either way:
 *   1. Exact match for the given currency (if active).
 *   2. The product's default/international price (should be USD).
 *   3. INR, with `isEmergencyFallback: true` so the UI/admin can flag it.
 *
 * IMPORTANT: when called for checkout purposes, `requestedCurrency` must
 * come from server-side region verification (IP → billing country →
 * payment method country → verified account country), never from the
 * client's display-currency preference. See README "Regional pricing".
 */
export function resolveProductPrice(
  product: Pick<ProductSummary, "prices">,
  requestedCurrency: CurrencyCode
): ResolvedPrice {
  const activePrices = product.prices.filter((p) => p.isActive !== false);

  const exact = activePrices.find((p) => p.currencyCode === requestedCurrency);
  if (exact) {
    return {
      currencyCode: exact.currencyCode,
      regularPrice: exact.regularPrice,
      salePrice: exact.salePrice,
      isFallback: false,
      isEmergencyFallback: false,
    };
  }

  const international =
    activePrices.find((p) => p.isDefault) ??
    activePrices.find((p) => p.currencyCode === FALLBACK_CURRENCY);
  if (international) {
    return {
      currencyCode: international.currencyCode,
      regularPrice: international.regularPrice,
      salePrice: international.salePrice,
      isFallback: true,
      isEmergencyFallback: false,
    };
  }

  const inr = activePrices.find((p) => p.currencyCode === "INR");
  if (inr) {
    return {
      currencyCode: inr.currencyCode,
      regularPrice: inr.regularPrice,
      salePrice: inr.salePrice,
      isFallback: true,
      isEmergencyFallback: true,
    };
  }

  throw new Error("Product has no active regional prices configured (not even INR).");
}

function findPrice(product: Pick<ProductSummary, "prices">, currency: CurrencyCode) {
  return product.prices.find((p) => p.currencyCode === currency && p.isActive !== false);
}

export { findPrice };
