import { FALLBACK_CURRENCY, type CurrencyCode } from "@/types/pricing";
import type { ProductSummary } from "@/types/catalog";

export interface ResolvedPrice {
  currencyCode: CurrencyCode;
  regularPrice: number;
  salePrice?: number;
  /** True when we couldn't honor the requested currency and had to fall back. */
  isFallback: boolean;
  /** True only when India has no INR price and we use another clearly-labelled currency. */
  isEmergencyFallback: boolean;
}

/**
 * Resolves the price to DISPLAY for a product given a currency. This is
 * used both for the customer-facing display currency (frontend, informational
 * only) and — with a backend-verified region instead of the frontend
 * preference — for the actual checkout amount. The fallback order is the
 * same either way:
 *   1. Exact match for the given currency (if active).
 *   2. USD/international fallback for non-India customers.
 *   3. Another non-INR active price, clearly labelled.
 *   4. INR only when the requested currency is INR.
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
      salePrice: activeSalePrice(exact),
      isFallback: false,
      isEmergencyFallback: false,
    };
  }

  const international = activePrices.find((p) => p.currencyCode === FALLBACK_CURRENCY);
  if (international) {
    return {
      currencyCode: international.currencyCode,
      regularPrice: international.regularPrice,
      salePrice: activeSalePrice(international),
      isFallback: true,
      isEmergencyFallback: false,
    };
  }

  const nonInrFallback = activePrices.find((p) => p.currencyCode !== "INR");
  if (requestedCurrency !== "INR" && nonInrFallback) {
    return {
      currencyCode: nonInrFallback.currencyCode,
      regularPrice: nonInrFallback.regularPrice,
      salePrice: activeSalePrice(nonInrFallback),
      isFallback: true,
      isEmergencyFallback: false,
    };
  }

  const inr = requestedCurrency === "INR" ? activePrices.find((p) => p.currencyCode === "INR") : undefined;
  if (inr) {
    return {
      currencyCode: inr.currencyCode,
      regularPrice: inr.regularPrice,
      salePrice: activeSalePrice(inr),
      isFallback: true,
      isEmergencyFallback: true,
    };
  }

  throw new Error(`Product has no active ${requestedCurrency} or international price configured.`);
}

function activeSalePrice(price: ProductSummary["prices"][number]) {
  if (price.salePrice == null) return undefined;
  const now = Date.now();
  if (price.saleStartDate && now < new Date(price.saleStartDate).getTime()) return undefined;
  if (price.saleEndDate && now > new Date(price.saleEndDate).getTime()) return undefined;
  return price.salePrice;
}

function findPrice(product: Pick<ProductSummary, "prices">, currency: CurrencyCode) {
  return product.prices.find((p) => p.currencyCode === currency && p.isActive !== false);
}

export { findPrice };
