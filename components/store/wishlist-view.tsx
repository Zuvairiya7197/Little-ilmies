"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useWishlistLineItems } from "@/hooks/use-wishlist-line-items";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";

export function WishlistView() {
  const items = useWishlistLineItems();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="container-content py-6 xs:py-8 md:py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
          Wishlist
        </h1>
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save books you love and come back to them anytime."
          action={
            <Link href="/shop" className="btn-primary">
              Browse Books
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <div className="mb-6 flex items-baseline justify-between xs:mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
          Wishlist
        </h1>
        <p className="text-sm text-ink-400">
          {items.length} {items.length === 1 ? "book" : "books"}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.productId} className="card-surface flex gap-4 p-4">
            <Link
              href={`/product/${item.slug}`}
              className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200"
            >
              <Image src={item.coverImage} alt="" fill sizes="80px" className="object-cover" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${item.slug}`}>
                  <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink-600 hover:text-sage-700">
                    {item.title}
                  </h3>
                </Link>
                <p className="mt-1 font-display text-base font-semibold text-ink-600">
                  {formatPrice(item.price, item.currencyCode)}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    addToCart({
                      productId: item.productId,
                      slug: item.slug,
                      title: item.title,
                      coverImage: item.coverImage,
                    })
                  }
                  className="tap-target flex items-center gap-1.5 rounded-full bg-ink-500 px-4 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-ink-600"
                >
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist({
                      productId: item.productId,
                      slug: item.slug,
                      title: item.title,
                      coverImage: item.coverImage,
                    })
                  }
                  className="tap-target text-xs font-semibold text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
