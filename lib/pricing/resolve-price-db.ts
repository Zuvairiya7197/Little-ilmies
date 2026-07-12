import { prisma } from "@/lib/db/prisma";
import { FALLBACK_CURRENCY, type CurrencyCode } from "@/types/pricing";

export interface ResolvedDbPrice {
  currencyCode: CurrencyCode;
  regularPrice: number;
  salePrice: number | null;
  isFallback: boolean;
  isEmergencyFallback: boolean;
}

/**
 * Database-backed equivalent of lib/pricing/resolve-price.ts's
 * resolveProductPrice, used at checkout where prices must come from the
 * live ProductPrice table rather than the static demo data in data/products.ts.
 * Same fallback order: exact currency match → international/USD default →
 * INR emergency fallback.
 */
export async function resolveProductPriceFromDb(
  productId: string,
  requestedCurrency: CurrencyCode
): Promise<ResolvedDbPrice> {
  const prices = await prisma.productPrice.findMany({
    where: { productId, isActive: true },
  });

  const exact = prices.find((p) => p.currencyCode === requestedCurrency);
  if (exact) {
    return {
      currencyCode: exact.currencyCode as CurrencyCode,
      regularPrice: exact.regularPrice,
      salePrice: exact.salePrice,
      isFallback: false,
      isEmergencyFallback: false,
    };
  }

  const international =
    prices.find((p) => p.isDefault) ?? prices.find((p) => p.currencyCode === FALLBACK_CURRENCY);
  if (international) {
    return {
      currencyCode: international.currencyCode as CurrencyCode,
      regularPrice: international.regularPrice,
      salePrice: international.salePrice,
      isFallback: true,
      isEmergencyFallback: false,
    };
  }

  const inr = prices.find((p) => p.currencyCode === "INR");
  if (inr) {
    return {
      currencyCode: inr.currencyCode as CurrencyCode,
      regularPrice: inr.regularPrice,
      salePrice: inr.salePrice,
      isFallback: true,
      isEmergencyFallback: true,
    };
  }

  throw new Error(`Product ${productId} has no active regional prices configured.`);
}
