"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Eye } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useProductPrice } from "@/hooks/use-product-price";

export function ProductCard({ product }: { product: ProductSummary }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) =>
    s.items.some((i) => i.productId === product.id)
  );

  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;
  const isOnSale = Boolean(resolvedPrice.salePrice);

  return (
    <div className="group relative flex flex-col transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-2xl bg-cream-200 shadow-soft transition-shadow duration-300 group-hover:shadow-clay">
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[3/4]"
          aria-label={`View ${product.title}`}
        >
          <Image
            src={product.coverImage}
            alt={`${product.title} book cover`}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {(product.isBestseller || product.isNewArrival || isOnSale) && (
          <span
            className={cn(
              "absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide xs:text-[11px]",
              isOnSale
                ? "bg-gold-500 text-cream-50"
                : product.isBestseller
                  ? "bg-ink-500 text-cream-50"
                  : "bg-sage-500 text-cream-50"
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
          className="tap-target absolute right-2 top-2 flex items-center justify-center rounded-full bg-cream-50/90 text-ink-500 shadow-soft backdrop-blur transition-transform duration-200 hover:scale-125 active:scale-90"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-gold-500 text-gold-500 animate-heart-pop" : "text-ink-400"
            )}
            aria-hidden="true"
          />
        </button>

        <Link
          href={`/product/${product.slug}#preview`}
          className="tap-target absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-cream-50/90 px-3 py-1.5 text-xs font-semibold text-ink-600 opacity-0 shadow-soft backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 xs:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Preview
        </Link>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sage-600">
          {product.category.name}
        </p>
        <Link href={`/product/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink-600 transition-colors hover:text-sage-700">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-300">
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

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-ink-600">
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
            className="tap-target rounded-full bg-ink-500 px-4 py-2 text-xs font-semibold text-cream-50 transition-all hover:bg-ink-600 active:scale-95"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
