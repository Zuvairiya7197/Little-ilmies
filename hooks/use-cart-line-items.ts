"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { getProductBySlug } from "@/data/products";
import type { CurrencyCode } from "@/types/pricing";

export interface CartLineItem {
  productId: string;
  slug: string;
  title: string;
  coverImage: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currencyCode: CurrencyCode;
  isFallbackPrice: boolean;
}

/**
 * Joins persisted cart items (identity only) with live product data and
 * resolves each line's price in the customer's currently selected currency.
 * Because nothing here is frozen at add-to-cart time, switching currency
 * automatically recalculates every line — there is no stale price to sync.
 */
export function useCartLineItems() {
  const items = useCartStore((s) => s.items);
  const currency = useCurrencyStore((s) => s.currency);

  return useMemo<CartLineItem[]>(() => {
    return items.flatMap((item) => {
      const product = getProductBySlug(item.slug);
      if (!product) return [];

      const resolved = resolveProductPrice(product, currency);
      const unitPrice = resolved.salePrice ?? resolved.regularPrice;

      return [
        {
          productId: item.productId,
          slug: item.slug,
          title: item.title,
          coverImage: item.coverImage,
          quantity: item.quantity,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
          currencyCode: resolved.currencyCode,
          isFallbackPrice: resolved.isFallback,
        },
      ];
    });
  }, [items, currency]);
}
