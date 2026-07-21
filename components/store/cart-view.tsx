"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ShoppingCart,
  Tag,
  Minus,
  Plus,
  Trash2,
  Heart,
  ShieldCheck,
  Download,
  Lock,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const trustBadges = [
  { label: "Secure Checkout", icon: ShieldCheck, iconColor: "text-sunny-600" },
  { label: "Instant Download", icon: Download, iconColor: "text-ink-500" },
  { label: "100% Safe & Trusted", icon: Lock, iconColor: "text-sage-600" },
  { label: "Loved by Families", icon: Heart, iconColor: "text-blossom-500" },
] as const;

export function CartView() {
  const lineItems = useCartLineItems();
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const regularSubtotal = lineItems.reduce((sum, i) => sum + i.regularUnitPrice * i.quantity, 0);
  const savings = Math.max(0, regularSubtotal - subtotal);
  const currencyCode = lineItems[0]?.currencyCode;

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    // Coupon validation is a backend concern (Phase 5/6 admin coupons) —
    // this UI only wires up the interaction for now.
    setCouponMessage("Coupon codes will be validated at checkout.");
  }

  function moveAllToWishlist() {
    for (const item of lineItems) {
      toggleWishlist({
        productId: item.productId,
        slug: item.slug,
        title: item.title,
        coverImage: item.coverImage,
      });
      removeItem(item.productId);
    }
  }

  if (lineItems.length === 0) {
    return (
      <div className="container-content py-6 xs:py-8 md:py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our collection and find your child's next favourite book."
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
      {/* Mobile & tablet: cart icon + subtitle, matches app-style cart design */}
      <div className="mb-6 md:hidden">
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink-700">
          <ShoppingCart className="h-6 w-6 text-ink-600" aria-hidden="true" />
          Your Cart ({lineItems.length})
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">Review your items and proceed to checkout.</p>
      </div>

      <h1 className="mb-6 hidden font-display text-2xl font-semibold text-ink-700 md:block xs:mb-8 xs:text-3xl">
        Cart ({lineItems.length})
      </h1>

      <div className="md:flex md:items-start md:gap-10">
        <div className="min-w-0 flex-1">
          {/* Mobile & tablet: individual cards with quantity stepper, matches app-style cart design */}
          <ul className="flex flex-col gap-4 md:hidden">
            {lineItems.map((item) => (
              <li key={item.productId} className="rounded-3xl bg-cream-50 p-4 shadow-clay-sm">
                <div className="flex gap-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-ink-100 to-blossom-100"
                  >
                    <Image src={item.coverImage} alt="" fill sizes="80px" className="object-contain p-2" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    {(item.isBestseller || item.isNewArrival || item.isOnSale) && (
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          item.isOnSale
                            ? "bg-blossom-500 text-cream-50"
                            : item.isBestseller
                              ? "bg-ink-600 text-cream-50"
                              : "bg-teal-500 text-cream-50"
                        )}
                      >
                        {item.isOnSale ? "Sale" : item.isBestseller ? "Bestseller" : "New"}
                      </span>
                    )}
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold leading-snug text-ink-700">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs text-ink-400">
                      Ages {item.ageRange} · {item.pageCount}pg
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="tap-target flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-ink-600"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-ink-700">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="tap-target flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-ink-600"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                    className="tap-target flex h-9 w-9 items-center justify-center rounded-full bg-blossom-50 text-blossom-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 flex items-baseline gap-2 border-t border-ink-100 pt-3">
                  <span className="font-display text-lg font-semibold text-ink-700">
                    {formatPrice(item.unitPrice, item.currencyCode)}
                  </span>
                  {item.isOnSale && (
                    <span className="text-sm text-ink-300 line-through">
                      {formatPrice(item.regularUnitPrice, item.currencyCode)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={moveAllToWishlist}
            className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cream-100 py-3 text-sm font-semibold text-ink-600 md:hidden"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            Move all items to wishlist
          </button>

          {/* Desktop: compact divided rows, unchanged */}
          <ul className="hidden divide-y divide-ink-100 border-y border-ink-100 md:block xs:border xs:rounded-3xl xs:px-5">
            {lineItems.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4 xs:py-5">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200 xs:h-28"
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
                    <p className="mt-1 text-sm text-ink-400">
                      {formatPrice(item.unitPrice, item.currencyCode)} each
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-4">
                    <span className="font-display text-base font-semibold text-ink-600">
                      {formatPrice(item.lineTotal, item.currencyCode)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
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

        <div className="mt-6 shrink-0 md:mt-0 md:w-80">
          <div className="card-surface p-5">
            <h2 className="mb-5 font-display text-lg font-semibold text-ink-700">Order Summary</h2>

            <form onSubmit={applyCoupon} className="mb-5">
              <label htmlFor="coupon" className="section-eyebrow mb-2 block">
                Coupon code
              </label>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Tag
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
                    aria-hidden="true"
                  />
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="store-input rounded-full py-2 pl-9 pr-3 text-sm"
                  />
                </div>
                <button type="submit" className="btn-secondary px-4 text-sm">
                  Apply
                </button>
              </div>
              {couponMessage && <p className="mt-2 text-xs text-ink-400">{couponMessage}</p>}
            </form>

            <div className="flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex items-center justify-between text-ink-400">
                <span>Subtotal ({lineItems.length} {lineItems.length === 1 ? "item" : "items"})</span>
                <span>{currencyCode ? formatPrice(regularSubtotal, currencyCode) : null}</span>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between text-blossom-600">
                  <span>Discount</span>
                  <span>- {currencyCode ? formatPrice(savings, currencyCode) : null}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3 font-display text-lg font-semibold text-ink-700">
                <span>Total</span>
                <span>{currencyCode ? formatPrice(subtotal, currencyCode) : null}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary mt-5 w-full">
              Proceed to Checkout
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-3xl bg-cream-50 p-4 shadow-clay-sm md:hidden">
            {trustBadges.map(({ label, icon: Icon, iconColor }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} aria-hidden="true" />
                <span className="text-xs font-semibold leading-tight text-ink-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
