"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { getProductBySlug } from "@/data/products";
import type { CurrencyCode } from "@/types/pricing";

export interface CartLineItem {
  cartItemId: string;
  type: "PRODUCT" | "CUSTOM_BUNDLE";
  productId: string;
  bundleId?: string;
  slug: string;
  title: string;
  coverImage: string;
  quantity: number;
  unitPrice: number;
  regularUnitPrice: number;
  lineTotal: number;
  currencyCode: CurrencyCode;
  isFallbackPrice: boolean;
  isOnSale: boolean;
  ageRange: string;
  pageCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  selectedBooks?: { id: string; slug: string; title: string; coverImage: string }[];
  bundleSize?: number;
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
    return items.flatMap((item): CartLineItem[] => {
      const cartItemId = item.cartItemId ?? item.productId;
      if (item.type === "CUSTOM_BUNDLE" && item.bundleSize && item.bundlePrices) {
        const exactPrice = item.bundlePrices.find(
          (price) => price.quantity === item.bundleSize && price.currencyCode === currency && price.enabled
        );
        const fallbackPrice =
          exactPrice ??
          item.bundlePrices.find((price) => price.quantity === item.bundleSize && price.currencyCode === "USD" && price.enabled);
        if (!fallbackPrice) return [];

        return [
          {
            cartItemId,
            type: "CUSTOM_BUNDLE",
            productId: item.productId,
            bundleId: item.bundleId,
            slug: item.slug,
            title: item.title,
            coverImage: item.coverImage,
            quantity: 1,
            unitPrice: fallbackPrice.price,
            regularUnitPrice: fallbackPrice.compareAtPrice ?? fallbackPrice.price,
            lineTotal: fallbackPrice.price,
            currencyCode: fallbackPrice.currencyCode as CurrencyCode,
            isFallbackPrice: fallbackPrice.currencyCode !== currency,
            isOnSale: false,
            ageRange: item.ageRange ?? "",
            pageCount: item.pageCount ?? 0,
            selectedBooks: item.selectedBooks,
            bundleSize: item.bundleSize,
          },
        ];
      }

      const product = getProductBySlug(item.slug);
      const productSnapshot =
        item.prices && item.ageRange && item.pageCount
          ? {
              prices: item.prices,
              ageRange: item.ageRange,
              pageCount: item.pageCount,
              isBestseller: item.isBestseller,
              isNewArrival: item.isNewArrival,
            }
          : null;
      const lineProduct = product ?? productSnapshot;
      if (!lineProduct) return [];

      const resolved = resolveProductPrice(lineProduct, currency);
      const unitPrice = resolved.salePrice ?? resolved.regularPrice;

      return [
        {
          productId: item.productId,
          cartItemId,
          type: "PRODUCT",
          slug: item.slug,
          title: item.title,
          coverImage: item.coverImage,
          quantity: item.quantity,
          unitPrice,
          regularUnitPrice: resolved.regularPrice,
          lineTotal: unitPrice * item.quantity,
          currencyCode: resolved.currencyCode,
          isFallbackPrice: resolved.isFallback,
          isOnSale: Boolean(resolved.salePrice),
          ageRange: lineProduct.ageRange,
          pageCount: lineProduct.pageCount,
          isBestseller: lineProduct.isBestseller,
          isNewArrival: lineProduct.isNewArrival,
        },
      ];
    });
  }, [items, currency]);
}
