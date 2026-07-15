"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Tag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";

export function CartView() {
  const lineItems = useCartLineItems();
  const removeItem = useCartStore((s) => s.removeItem);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const currencyCode = lineItems[0]?.currencyCode;

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    // Coupon validation is a backend concern (Phase 5/6 admin coupons) —
    // this UI only wires up the interaction for now.
    setCouponMessage("Coupon codes will be validated at checkout.");
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
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:mb-8 xs:text-3xl">
        Cart ({lineItems.length})
      </h1>

      <div className="md:flex md:items-start md:gap-10">
        <ul className="min-w-0 flex-1 divide-y divide-ink-100 border-y border-ink-100 xs:border xs:rounded-3xl xs:px-5">
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

        <div className="mt-6 shrink-0 md:mt-0 md:w-80">
          <div className="card-surface p-5">
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
                <span>Subtotal</span>
                <span>{currencyCode ? formatPrice(subtotal, currencyCode) : null}</span>
              </div>
              <div className="flex items-center justify-between text-ink-400">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3 font-display text-lg font-semibold text-ink-700">
                <span>Total</span>
                <span>{currencyCode ? formatPrice(subtotal, currencyCode) : null}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary mt-5 w-full">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
