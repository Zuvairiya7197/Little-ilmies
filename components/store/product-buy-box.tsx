"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle2, ShoppingCart, AlertTriangle, Download, BookOpen, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useProductPrice } from "@/hooks/use-product-price";
import { cn } from "@/lib/utils/cn";
import type { ProductDetail } from "@/types/catalog";
import { calculateRentalPrice } from "@/lib/rentals/pricing";
import { RENTAL_CURRENCY_CODE, RENTAL_DURATION_DAYS } from "@/lib/rentals/config";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";

export function ProductBuyBox({
  product,
  rentalEligible = false,
  owns = false,
  activeRentalExpiresAt = null,
}: {
  product: ProductDetail;
  rentalEligible?: boolean;
  owns?: boolean;
  activeRentalExpiresAt?: string | null;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) =>
    s.items.some((i) => i.productId === product.id)
  );

  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;
  const inrPrice = resolveProductPrice(product, RENTAL_CURRENCY_CODE);
  const rentalPrice = calculateRentalPrice(inrPrice.salePrice ?? inrPrice.regularPrice);
  const isRenting = Boolean(activeRentalExpiresAt);
  const rentalExpiryLabel = activeRentalExpiresAt
    ? new Date(activeRentalExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;
  // Server-calculated upgrade credit: the amount already paid for the active
  // rental applied toward this book's current sale price. Never let a
  // client-side number reach checkout — /checkout re-derives this the same
  // way from the paid rental order, this is display-only.
  const upgradePrice = isRenting ? Math.max(0, (resolvedPrice.salePrice ?? resolvedPrice.regularPrice) - rentalPrice) : null;

  function addToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
      prices: product.prices,
      ageRange: product.ageRange,
      pageCount: product.pageCount,
      isBestseller: product.isBestseller,
      isNewArrival: product.isNewArrival,
    });
  }

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  function rentNow() {
    addItem({
      type: "RENTAL",
      cartItemId: `rental:${product.id}`,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
      prices: product.prices,
      ageRange: product.ageRange,
      pageCount: product.pageCount,
      isBestseller: product.isBestseller,
      isNewArrival: product.isNewArrival,
    });
    router.push("/checkout");
  }

  function upgradeNow() {
    addItem({
      type: "UPGRADE",
      cartItemId: `upgrade:${product.id}`,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
      prices: product.prices,
      ageRange: product.ageRange,
      pageCount: product.pageCount,
      isBestseller: product.isBestseller,
      isNewArrival: product.isNewArrival,
    });
    router.push("/checkout");
  }

  const showRentalOffer =
    rentalEligible && product.rentAndReadEnabled !== false && product.hasRentalPages === true && !isRenting && !owns;

  return (
    <>
      {/* Mobile & tablet: just Add to Cart + Add to Wishlist, matches app-style PDP design */}
      <div className="grid grid-cols-2 gap-5 lg:hidden">
        {owns ? (
          <Link
            href={`/api/download/${product.id}`}
            className="tap-target col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-ink-600 px-2 py-3 text-sm font-semibold text-cream-50 shadow-clay-primary transition-all active:scale-95 xs:text-base sm:gap-3 sm:py-4 sm:text-lg"
          >
            <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">You own this — Download</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={addToCart}
            className="tap-target flex items-center justify-center gap-1.5 rounded-2xl bg-ink-600 px-2 py-3 text-sm font-semibold text-cream-50 shadow-clay-primary transition-all active:scale-95 xs:text-base sm:gap-2 sm:py-4 sm:text-lg"
          >
            <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">Add to Cart</span>
          </button>
        )}
        {!owns && (
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
            className="tap-target flex items-center justify-center gap-1.5 rounded-2xl bg-cream-50 px-2 py-3 text-sm font-semibold text-ink-600 shadow-soft transition-all active:scale-95 xs:text-base sm:gap-2 sm:py-4 sm:text-lg"
          >
            <Heart
              className={cn("h-5 w-5 shrink-0", isWishlisted ? "fill-blossom-500 text-blossom-500" : "text-ink-500")}
              aria-hidden="true"
            />
            <span className="truncate">{isWishlisted ? "Saved" : "Add to Wishlist"}</span>
          </button>
        )}
        {isRenting && !owns && (
          <Link
            href={`/read/${product.id}`}
            className="tap-target col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-sage-50 px-2 py-3 text-sm font-semibold text-sage-800 shadow-soft transition-all active:scale-95 xs:text-base sm:gap-3 sm:py-4 sm:text-lg"
          >
            <BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
            Read Now
          </Link>
        )}
        {showRentalOffer && (
          <button
            type="button"
            onClick={rentNow}
            className="tap-target col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-sage-50 px-2 py-3 text-sm font-semibold text-sage-800 shadow-soft transition-all active:scale-95 xs:text-base sm:gap-3 sm:py-4 sm:text-lg"
          >
            Rent & Read - {formatPrice(rentalPrice, RENTAL_CURRENCY_CODE)}
          </button>
        )}
      </div>

      <div className="hidden rounded-3xl bg-cream-50 p-6 shadow-clay lg:block">
      {owns ? (
        <div className="flex items-center gap-2 rounded-2xl bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          You already own this ebook.
        </div>
      ) : (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-semibold text-ink-700">
            {formatPrice(displayPrice, resolvedPrice.currencyCode)}
            {resolvedPrice.isFallback && <span className="ml-1 text-base">{resolvedPrice.currencyCode}</span>}
          </span>
          {resolvedPrice.salePrice && (
            <span className="text-lg text-ink-300 line-through">
              {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
            </span>
          )}
        </div>
      )}
      <p className="mt-1 text-sm text-ink-400">Instant PDF download after purchase</p>

      {isRenting && !owns && (
        <div className="mt-5 rounded-2xl border border-sage-200 bg-sage-50 p-4">
          <p className="font-display text-lg font-semibold text-ink-700">You are currently renting this book</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            Access expires on {rentalExpiryLabel}.
          </p>
          <Link href={`/read/${product.id}`} className="btn-secondary mt-4 w-full justify-center">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Read Now
          </Link>
          {upgradePrice != null && (
            <div className="mt-4 border-t border-sage-200 pt-4">
              <p className="text-sm font-semibold text-ink-700">Want to keep this book?</p>
              <p className="mt-1 text-xs text-ink-500">
                Buy the ebook and keep permanent download access. The {formatPrice(rentalPrice, RENTAL_CURRENCY_CODE)}{" "}
                you already paid is credited toward the purchase.
              </p>
              <button type="button" onClick={upgradeNow} className="btn-primary mt-3 w-full justify-center">
                Upgrade for {formatPrice(upgradePrice, RENTAL_CURRENCY_CODE)}
              </button>
            </div>
          )}
        </div>
      )}

      {showRentalOffer && (
        <div className="mt-5 rounded-2xl border border-sage-200 bg-sage-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold text-ink-700">Rent & Read</p>
              <p className="mt-1 text-sm text-ink-500">
                Read online for {RENTAL_DURATION_DAYS} days. Online reading only — downloading and printing are
                not supported.
              </p>
            </div>
            <span className="shrink-0 font-display text-xl font-semibold text-sage-700">
              {formatPrice(rentalPrice, RENTAL_CURRENCY_CODE)}
            </span>
          </div>
          <button type="button" onClick={rentNow} className="btn-secondary mt-4 w-full justify-center">
            Rent & Read
          </button>
        </div>
      )}

      {resolvedPrice.isFallback && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Regional pricing is not available for your location, so checkout will use the clearly labelled
            {` ${resolvedPrice.currencyCode}`} price shown here.
          </span>
        </p>
      )}

      {owns ? (
        <Link href={`/api/download/${product.id}`} className="btn-primary mt-5 w-full justify-center">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </Link>
      ) : (
        <>
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
        </>
      )}

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
