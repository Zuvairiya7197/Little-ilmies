"use client";

import { formatPrice } from "@/lib/utils/format";
import { useProductPrice } from "@/hooks/use-product-price";
import type { ProductDetail } from "@/types/catalog";

export function ProductMobilePrice({ product }: { product: ProductDetail }) {
  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;

  return (
    <div className="mt-6 md:hidden">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl font-semibold text-ink-700">
          {formatPrice(displayPrice, resolvedPrice.currencyCode)}
        </span>
        {resolvedPrice.salePrice && (
          <span className="text-base text-ink-300 line-through">
            {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-400">Instant PDF download after purchase</p>
    </div>
  );
}
