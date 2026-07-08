"use client";

import { useMemo } from "react";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { getProductBySlug } from "@/data/products";
import type { CurrencyCode } from "@/types/pricing";

export interface WishlistLineItem {
  productId: string;
  slug: string;
  title: string;
  coverImage: string;
  price: number;
  currencyCode: CurrencyCode;
}

export function useWishlistLineItems() {
  const items = useWishlistStore((s) => s.items);
  const currency = useCurrencyStore((s) => s.currency);

  return useMemo<WishlistLineItem[]>(() => {
    return items.flatMap((item) => {
      const product = getProductBySlug(item.slug);
      if (!product) return [];

      const resolved = resolveProductPrice(product, currency);
      return [
        {
          productId: item.productId,
          slug: item.slug,
          title: item.title,
          coverImage: item.coverImage,
          price: resolved.salePrice ?? resolved.regularPrice,
          currencyCode: resolved.currencyCode,
        },
      ];
    });
  }, [items, currency]);
}
