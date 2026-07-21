"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useProductPrice } from "@/hooks/use-product-price";

/** Horizontal list-row product card — mobile "View all" style listing
 * (image thumbnail left, details right), distinct from the vertical grid
 * ProductCard used in the default shop grid. */
export function ProductRow({ product }: { product: ProductSummary }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));

  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;
  const isOnSale = Boolean(resolvedPrice.salePrice);

  return (
    <div className="flex gap-4 rounded-3xl bg-cream-50 p-4 shadow-clay-sm">
      <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-ink-100 to-blossom-100">
        <Link href={`/product/${product.slug}`} className="relative block h-full w-full" aria-label={`View ${product.title}`}>
          <Image
            src={product.coverImage}
            alt={`${product.title} book cover`}
            fill
            sizes="112px"
            className="object-contain p-3"
          />
        </Link>

        {(product.isBestseller || product.isNewArrival || isOnSale) && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
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
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sage-600">
              {product.category.name}
            </p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="mt-0.5 line-clamp-2 font-display text-base font-semibold leading-snug text-ink-700">
                {product.title}
              </h3>
            </Link>
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
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="tap-target flex shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-500 shadow-soft transition-transform duration-200 active:scale-90"
          >
            <Heart
              className={cn("h-4 w-4", isWishlisted ? "fill-blossom-500 text-blossom-500" : "text-ink-400")}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-300">
          <span>
            Ages {product.ageRange} · {product.pageCount}pg
          </span>
        </div>

        {product.reviewCount > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-300">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" aria-hidden="true" />
            <span className="font-semibold text-ink-500">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
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
            className="tap-target flex items-center gap-1.5 rounded-full bg-ink-600 px-4 py-2 text-xs font-semibold text-cream-50 transition-all hover:bg-ink-700 active:scale-95"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
