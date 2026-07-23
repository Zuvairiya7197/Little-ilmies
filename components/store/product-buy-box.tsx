"use client";

import { useRouter } from "next/navigation";
import { Heart, CheckCircle2, ShoppingCart, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useProductPrice } from "@/hooks/use-product-price";
import { cn } from "@/lib/utils/cn";
import type { ProductDetail } from "@/types/catalog";

export function ProductBuyBox({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) =>
    s.items.some((i) => i.productId === product.id)
  );

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

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  return (
    <>
      {/* Mobile & tablet: just Add to Cart + Add to Wishlist, matches app-style PDP design */}
      <div className="grid grid-cols-2 gap-5 lg:hidden">
        <button
          type="button"
          onClick={addToCart}
          className="tap-target flex items-center justify-center gap-2 rounded-2xl bg-ink-600 px-2 py-4 text-base font-semibold text-cream-50 shadow-clay-primary transition-all active:scale-95 sm:gap-3 sm:py-5 sm:text-xl"
        >
          <ShoppingCart className="h-6 w-6" aria-hidden="true" />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              coverImage: product.coverImage,
            })
          }
          aria-pressed={isWishlisted}
          className="tap-target flex items-center justify-center gap-2 rounded-2xl bg-cream-50 px-2 py-4 text-base font-semibold text-ink-600 shadow-soft transition-all active:scale-95 sm:gap-3 sm:py-5 sm:text-xl"
        >
          <Heart
            className={cn("h-6 w-6", isWishlisted ? "fill-blossom-500 text-blossom-500" : "text-ink-500")}
            aria-hidden="true"
          />
          {isWishlisted ? "Saved" : "Add to Wishlist"}
        </button>
      </div>

      <div className="hidden rounded-3xl bg-cream-50 p-6 shadow-clay lg:block">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-ink-700">
          {formatPrice(displayPrice, resolvedPrice.currencyCode)}
        </span>
        {resolvedPrice.salePrice && (
          <span className="text-lg text-ink-300 line-through">
            {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-400">Instant PDF download after purchase</p>

      {resolvedPrice.isEmergencyFallback && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Admin:</strong> no international price is set for this product — showing the
            INR price as a fallback. Add a USD price in the product editor.
          </span>
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={addToCart} className="btn-secondary flex-1">
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Add to Cart
        </button>
        <button type="button" onClick={buyNow} className="btn-primary flex-1">
          Buy Now
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          toggleWishlist({
            productId: product.id,
            slug: product.slug,
            title: product.title,
            coverImage: product.coverImage,
          })
        }
        aria-pressed={isWishlisted}
        className="tap-target mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink-100 py-3 text-sm font-semibold text-ink-500 transition-colors hover:border-gold-300 hover:bg-gold-50"
      >
        <Heart
          className={cn("h-4 w-4", isWishlisted ? "fill-gold-500 text-gold-500" : "text-ink-400")}
          aria-hidden="true"
        />
        {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>

      <ul className="mt-6 flex flex-col gap-2.5 border-t border-ink-100 pt-5 text-sm text-ink-500">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
          Secure checkout via Razorpay
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
          Instant download, no waiting
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
          Printable at home, unlimited copies for your family
        </li>
      </ul>
    </div>
    </>
  );
}
