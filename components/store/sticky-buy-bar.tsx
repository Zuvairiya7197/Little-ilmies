"use client";

import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useProductPrice } from "@/hooks/use-product-price";
import type { ProductDetail } from "@/types/catalog";

export function StickyBuyBar({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;

  function addToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
    });
  }

  function handleBuyNow() {
    addToCart();
    router.push("/checkout");
  }

  return (
    <div
      id="buy"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink-100 bg-cream-50/95 px-4 py-3 shadow-lifted backdrop-blur md:hidden"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-ink-300">{product.title}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-ink-600">
            {formatPrice(displayPrice, resolvedPrice.currencyCode)}
          </span>
          {resolvedPrice.salePrice && (
            <span className="text-xs text-ink-300 line-through">
              {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
            </span>
          )}
        </div>
      </div>
      <button type="button" onClick={addToCart} className="btn-secondary shrink-0 px-4">
        Add to Cart
      </button>
      <button type="button" onClick={handleBuyNow} className="btn-primary shrink-0 px-4">
        Buy Now
      </button>
    </div>
  );
}
