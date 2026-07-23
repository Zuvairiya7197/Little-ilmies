"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Eye, Search, ShoppingBag } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useProductPrice } from "@/hooks/use-product-price";
import { QuickViewModal } from "@/components/store/quick-view-modal";

// Soft pastel backdrops the cover sits on, rotated per card position so a
// row of covers reads as varied/colorful rather than uniform.
const COVER_TINTS = [
  "bg-gradient-to-b from-ink-100 to-blossom-100",
  "bg-gradient-to-b from-blossom-100 to-sunny-100",
  "bg-gradient-to-b from-ink-100 to-teal-50",
  "bg-gradient-to-b from-sage-100 to-teal-50",
  "bg-gradient-to-b from-sunny-100 to-lemon-100",
  "bg-gradient-to-b from-blossom-100 to-ink-100",
];

export function ProductCard({ product, tintIndex = 0 }: { product: ProductSummary; tintIndex?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) =>
    s.items.some((i) => i.productId === product.id)
  );
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;
  const isOnSale = Boolean(resolvedPrice.salePrice);

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-cream-50 shadow-clay transition-transform duration-300 hover:-translate-y-1">
      <div className={cn("relative overflow-hidden", COVER_TINTS[tintIndex % COVER_TINTS.length])}>
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[4/5]"
          aria-label={`View ${product.title}`}
        >
          <Image
            src={product.coverImage}
            alt={`${product.title} book cover`}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {(product.isBestseller || product.isNewArrival || isOnSale) && (
          <span
            className={cn(
              "absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide xs:text-[11px]",
              isOnSale
                ? "bg-blossom-500 text-cream-50"
                : product.isBestseller
                  ? "bg-ink-600 text-cream-50"
                  : "bg-teal-500 text-cream-50"
            )}
          >
            {isOnSale ? "Sale" : product.isBestseller ? "Bestseller" : "New"}
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
          className="tap-target absolute right-2.5 top-2.5 flex items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-soft transition-transform duration-200 hover:scale-125 active:scale-90"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-blossom-500 text-blossom-500 animate-heart-pop" : "text-ink-400"
            )}
            aria-hidden="true"
          />
        </button>

        <div className="absolute inset-x-2.5 bottom-2.5 hidden items-center justify-between gap-1.5 lg:flex">
          <Link
            href={`/product/${product.slug}#preview`}
            className="tap-target flex items-center gap-1.5 rounded-full bg-cream-50 px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-soft"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Preview
          </Link>
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Quick view ${product.title}`}
            className="tap-target hidden items-center justify-center rounded-full bg-cream-50 p-2 text-ink-600 shadow-soft transition-opacity sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sage-600">
          {product.category.name}
        </p>
        <Link href={`/product/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold leading-snug text-ink-700 transition-colors hover:text-sage-700">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex min-h-4 items-center gap-2 text-xs text-ink-300">
          {product.reviewCount > 0 && (
            <>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" aria-hidden="true" />
                {product.rating.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>Ages {product.ageRange}</span>
          <span aria-hidden="true">·</span>
          <span>{product.pageCount}pg</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-display text-lg font-semibold text-ink-700">
              {formatPrice(displayPrice, resolvedPrice.currencyCode)}
            </span>
            {isOnSale && (
              <span className="text-sm text-ink-300 line-through">
                {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                title: product.title,
                coverImage: product.coverImage,
              })
            }
            className="tap-target hidden items-center gap-1.5 rounded-full bg-ink-600 px-4 py-2 text-xs font-semibold text-cream-50 transition-all hover:bg-ink-700 active:scale-95 lg:flex"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            Add
          </button>
        </div>
      </div>

      <QuickViewModal product={quickViewOpen ? product : null} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
