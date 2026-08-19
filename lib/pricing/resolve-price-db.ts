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
 * Same fallback order: exact currency match → USD/international →
 * another non-INR price → INR only for India.
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
      salePrice: activeSalePrice(exact),
      isFallback: false,
      isEmergencyFallback: false,
    };
  }

  const international = prices.find((p) => p.currencyCode === FALLBACK_CURRENCY);
  if (international) {
    return {
      currencyCode: international.currencyCode as CurrencyCode,
      regularPrice: international.regularPrice,
      salePrice: activeSalePrice(international),
      isFallback: true,
      isEmergencyFallback: false,
    };
  }

  const nonInrFallback = prices.find((p) => p.currencyCode !== "INR");
  if (requestedCurrency !== "INR" && nonInrFallback) {
    return {
      currencyCode: nonInrFallback.currencyCode as CurrencyCode,
      regularPrice: nonInrFallback.regularPrice,
      salePrice: activeSalePrice(nonInrFallback),
      isFallback: true,
      isEmergencyFallback: false,
    };
  }

  const inr = requestedCurrency === "INR" ? prices.find((p) => p.currencyCode === "INR") : undefined;
  if (inr) {
    return {
      currencyCode: inr.currencyCode as CurrencyCode,
      regularPrice: inr.regularPrice,
      salePrice: activeSalePrice(inr),
      isFallback: true,
      isEmergencyFallback: true,
    };
  }

  throw new Error(`Product ${productId} has no active ${requestedCurrency} or international price configured.`);
}

function activeSalePrice(price: { salePrice: number | null; saleStartDate: Date | null; saleEndDate: Date | null }) {
  if (price.salePrice == null) return null;
  const now = Date.now();
  if (price.saleStartDate && now < price.saleStartDate.getTime()) return null;
  if (price.saleEndDate && now > price.saleEndDate.getTime()) return null;
  return price.salePrice;
}
