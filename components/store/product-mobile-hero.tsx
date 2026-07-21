"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { cn } from "@/lib/utils/cn";
import type { ProductDetail } from "@/types/catalog";

/** Mobile & tablet: single cover image with bestseller/sale badge, wishlist
 * heart, and pagination dots — matches app-style PDP design. Desktop keeps
 * the stacked-shadow BookPreviewCard. */
export function ProductMobileHero({ product }: { product: ProductDetail }) {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));

  const dotCount = Math.max(1, Math.min(5, product.previewImages.length || 1));

  return (
    <div className="md:hidden">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-b from-ink-100 to-blossom-100 shadow-clay">
        <Image
          src={product.coverImage}
          alt={`${product.title} book cover`}
          fill
          sizes="(max-width: 480px) 90vw, 420px"
          className="object-contain p-6"
          priority
        />

        {(product.isBestseller || product.isNewArrival) && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
              product.isBestseller ? "bg-ink-600 text-cream-50" : "bg-teal-500 text-cream-50"
            )}
          >
            {product.isBestseller ? "Bestseller" : "New"}
          </span>
        )}

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
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="tap-target absolute right-3 top-3 flex items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-soft"
        >
          <Heart
            className={cn("h-4 w-4", isWishlisted ? "fill-blossom-500 text-blossom-500" : "text-ink-400")}
            aria-hidden="true"
          />
        </button>
      </div>

      {dotCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full", i === 0 ? "w-4 bg-ink-600" : "w-1.5 bg-ink-100")} />
          ))}
        </div>
      )}
    </div>
  );
}
