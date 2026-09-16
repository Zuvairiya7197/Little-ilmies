"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { calculateRentalPrice } from "@/lib/rentals/pricing";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import { calculateCustomBundlePrice } from "@/lib/pricing/automatic-pricing";
import { getProductBySlug } from "@/data/products";
import type { CurrencyCode } from "@/types/pricing";

export interface CartLineItem {
  cartItemId: string;
  type: "PRODUCT" | "CUSTOM_BUNDLE" | "RENTAL" | "UPGRADE";
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
  selectedBooks?: { id: string; slug: string; title: string; coverImage: string; prices?: import("@/types/catalog").ProductSummary["prices"] }[];
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
        const selectedBooks = item.selectedBooks ?? [];
        const regularPrices = selectedBooks.flatMap((book) => {
          if (!book.prices) return [];
          return [resolveProductPrice({ prices: book.prices }, currency).regularPrice];
        });
        if (regularPrices.length !== item.bundleSize) return [];

        const computed = calculateCustomBundlePrice(regularPrices, item.customBundleDiscountPercentage, currency);

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
            unitPrice: computed.salePrice,
            regularUnitPrice: computed.regularPrice,
            lineTotal: computed.salePrice,
            currencyCode: currency,
            isFallbackPrice: false,
            isOnSale: computed.salePrice < computed.regularPrice,
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

      if (item.type === "RENTAL") {
        const resolved = resolveProductPrice(lineProduct, RENTAL_CURRENCY_CODE);
        const salePrice = resolved.salePrice ?? resolved.regularPrice;
        const unitPrice = calculateRentalPrice(salePrice);

        return [
          {
            productId: item.productId,
            cartItemId,
            type: "RENTAL",
            slug: item.slug,
            title: item.title,
            coverImage: item.coverImage,
            quantity: 1,
            unitPrice,
            regularUnitPrice: unitPrice,
            lineTotal: unitPrice,
            currencyCode: RENTAL_CURRENCY_CODE,
            isFallbackPrice: false,
            isOnSale: false,
            ageRange: lineProduct.ageRange,
            pageCount: lineProduct.pageCount,
            isBestseller: lineProduct.isBestseller,
            isNewArrival: lineProduct.isNewArrival,
          },
        ];
      }

      if (item.type === "UPGRADE") {
        // Display estimate only — /checkout/create-order recomputes the
        // real credit server-side from the buyer's actual paid rental
        // order, since the amount already paid isn't available client-side.
        const resolvedInr = resolveProductPrice(lineProduct, RENTAL_CURRENCY_CODE);
        const salePriceInr = resolvedInr.salePrice ?? resolvedInr.regularPrice;
        const rentalPricePaidEstimate = calculateRentalPrice(salePriceInr);
        const unitPrice = Math.max(0, salePriceInr - rentalPricePaidEstimate);

        return [
          {
            productId: item.productId,
            cartItemId,
            type: "UPGRADE",
            slug: item.slug,
            title: item.title,
            coverImage: item.coverImage,
            quantity: 1,
            unitPrice,
            regularUnitPrice: unitPrice,
            lineTotal: unitPrice,
            currencyCode: RENTAL_CURRENCY_CODE,
            isFallbackPrice: false,
            isOnSale: false,
            ageRange: lineProduct.ageRange,
            pageCount: lineProduct.pageCount,
            isBestseller: lineProduct.isBestseller,
            isNewArrival: lineProduct.isNewArrival,
          },
        ];
      }

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
