"use client";

import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import type { ProductSummary } from "@/types/catalog";

export function useProductPrice(product: Pick<ProductSummary, "prices">) {
  const currency = useCurrencyStore((s) => s.currency);
  return resolveProductPrice(product, currency);
}
