"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Download,
  Infinity,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";

const benefitItems = [
  {
    label: "Continue Shopping",
    description: "Browse more books and resources",
    icon: ArrowLeft,
    href: "/shop",
  },
  {
    label: "Instant Download",
    description: "Access right after purchase",
    icon: Download,
    href: undefined,
  },
  {
    label: "Lifetime Access",
    description: "Download anytime, anywhere",
    icon: Infinity,
    href: undefined,
  },
  {
    label: "High Quality",
    description: "Well designed & print friendly",
    icon: Award,
    href: undefined,
  },
] as const;

export function CartView() {
  const lineItems = useCartLineItems();
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const regularSubtotal = lineItems.reduce((sum, item) => sum + item.regularUnitPrice * item.quantity, 0);
  const savings = Math.max(0, regularSubtotal - subtotal);
  const currencyCode = lineItems[0]?.currencyCode;

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage("Coupon codes will be validated at checkout.");
  }

  if (lineItems.length === 0) {
    return (
      <div className="container-content py-8 md:py-12">
        <h1 className="font-display text-3xl font-semibold text-ink-700">My Cart</h1>
        <EmptyState
          icon={ShoppingCart}
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
    <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-white via-cream-50 to-lilac-50/70">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-4 sm:px-8 md:py-5 xl:px-10">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-7">
          <section className="min-w-0">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="font-display text-2xl font-bold leading-none text-ink-900 sm:text-3xl">
                  My Cart
                </h1>
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-lilac-100 px-2.5 font-display text-base font-bold text-ink-800">
                  {lineItems.length}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-400 sm:text-base">
                <ShoppingCart className="h-5 w-5 text-violet-700" aria-hidden="true" />
                Review your items before checkout.
              </p>
            </div>

            <ul className="mt-5 space-y-3">
              {lineItems.map((item) => (
                <li
                  key={item.productId}
                  className="rounded-3xl border border-lilac-100 bg-white/92 p-4 shadow-[0_18px_55px_rgba(75,31,124,0.08)] sm:p-5"
                >
                  <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[142px_minmax(0,1fr)_138px_108px_64px] lg:items-center">
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative h-32 w-full max-w-36 overflow-hidden rounded-2xl bg-gradient-to-br from-lilac-50 via-white to-blossom-50 sm:w-36 lg:h-36"
                    >
                      <Image src={item.coverImage} alt="" fill sizes="144px" className="object-contain p-2.5" />
                    </Link>

                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`}>
                        <h2 className="max-w-xl font-display text-lg font-bold leading-tight text-ink-900 sm:text-xl">
                          {item.title}
                        </h2>
                      </Link>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="font-display text-xl font-bold text-violet-700">
                          {formatPrice(item.unitPrice, item.currencyCode)}
                        </span>
                        <span className="text-sm font-medium text-ink-300">each</span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-lilac-100 px-3 py-1.5 text-xs font-semibold text-violet-800">
                        <Tag className="h-4 w-4" aria-hidden="true" />
                        Digital Download
                      </span>
                    </div>

                    <div className="flex h-10 w-full max-w-34 items-center justify-between rounded-2xl border border-lilac-200 bg-white px-3 text-base font-semibold text-ink-500 shadow-sm sm:col-start-2 lg:col-start-auto">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="grid h-8 w-8 place-items-center rounded-full text-violet-800 transition hover:bg-lilac-50"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="grid h-8 w-8 place-items-center rounded-full text-violet-800 transition hover:bg-lilac-50"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="font-display text-xl font-bold text-ink-900 sm:col-start-2 lg:col-start-auto">
                      {formatPrice(item.lineTotal, item.currencyCode)}
                    </div>

                    <div className="flex items-center gap-3 sm:col-start-2 lg:col-start-auto lg:flex-col">
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove item"
                        className="grid h-10 w-10 place-items-center rounded-full bg-lilac-50 text-violet-800 transition hover:bg-blossom-50 hover:text-blossom-600"
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-sm font-semibold text-violet-800 hover:text-blossom-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 hidden rounded-3xl border border-lilac-200 bg-white/75 px-6 py-4 shadow-[0_16px_45px_rgba(75,31,124,0.06)] md:flex md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-lilac-100 text-violet-800">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-900">Safe & Secure</h2>
                  <p className="mt-1 text-sm font-medium text-ink-400">
                    Your data and payments are always protected.
                  </p>
                </div>
              </div>
              <div className="relative h-20 w-72">
                <Image src="/images/safe & secure.png" alt="" fill sizes="288px" className="object-contain" />
              </div>
            </div>
          </section>

          <aside className="xl:pt-3">
            <div className="sticky top-5 rounded-3xl border border-lilac-200 bg-white/92 p-5 shadow-[0_20px_65px_rgba(75,31,124,0.09)]">
              <h2 className="font-display text-xl font-bold text-ink-900">Order Summary</h2>

              <form onSubmit={applyCoupon} className="mt-5">
                <label className="mb-2 flex items-center gap-3 text-base font-semibold text-green-700" htmlFor="coupon">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-green-50">
                    <Tag className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Have a coupon code?
                </label>
                <div className="grid gap-3 sm:grid-cols-[1fr_116px]">
                  <input
                    id="coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="h-11 rounded-2xl border border-lilac-200 bg-white px-4 text-base font-medium text-ink-700 outline-none transition placeholder:text-ink-200 focus:border-violet-400 focus:ring-4 focus:ring-lilac-100"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-2xl bg-green-100 px-5 text-base font-bold text-green-700 transition hover:bg-green-200"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && <p className="mt-3 text-sm font-medium text-ink-400">{couponMessage}</p>}
              </form>

              <div className="mt-4 space-y-3 border-y border-dashed border-lilac-200 py-4 text-base">
                <div className="flex items-center justify-between text-ink-700">
                  <span>Subtotal ({lineItems.length} {lineItems.length === 1 ? "item" : "items"})</span>
                  <span className="font-semibold">{currencyCode ? formatPrice(regularSubtotal, currencyCode) : null}</span>
                </div>
                <div className="flex items-center justify-between text-ink-700">
                  <span>Discount</span>
                  <span className="font-semibold text-green-700">
                    - {currencyCode ? formatPrice(savings, currencyCode) : null}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-ink-900">Total</span>
                <span className="font-display text-2xl font-bold text-violet-800">
                  {currencyCode ? formatPrice(subtotal, currencyCode) : null}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-lilac-100/75 px-4 py-2.5 text-xs font-semibold text-ink-500">
                <ShieldCheck className="h-5 w-5 text-violet-700" aria-hidden="true" />
                <span>You&apos;ll earn 2 points with this order!</span>
              </div>

              <Link
                href="/checkout"
                className="mt-4 flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-5 py-2.5 text-center text-lg font-bold text-white shadow-[0_16px_30px_rgba(105,22,176,0.26)] transition hover:scale-[1.01]"
              >
                <Lock className="h-5 w-5" aria-hidden="true" />
                Proceed to Checkout
              </Link>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-ink-400">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                Secure checkout • 100% safe payment
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-5 grid gap-3 rounded-3xl border border-lilac-100 bg-white/70 p-3 shadow-[0_12px_40px_rgba(75,31,124,0.05)] md:grid-cols-4">
          {benefitItems.map(({ label, description, icon: Icon, href }) => {
            const content = (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-lilac-200 bg-lilac-50 text-violet-800">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-ink-900">{label}</span>
                  <span className="mt-0.5 block text-xs font-medium text-ink-400">{description}</span>
                </span>
              </>
            );

            return href ? (
              <Link key={label} href={href} className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-white">
                {content}
              </Link>
            ) : (
              <div key={label} className="flex items-center gap-4 rounded-2xl p-2 md:border-l md:border-lilac-100 md:pl-6">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
