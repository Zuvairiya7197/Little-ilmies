"use client";

import Image from "next/image";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { formatPrice } from "@/lib/utils/format";

export function CheckoutOrderSummary() {
  const lineItems = useCartLineItems();
  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const currencyCode = lineItems[0]?.currencyCode;

  return (
    <div className="card-surface p-5">
      <h2 className="font-display text-lg font-semibold text-ink-700">Order Summary</h2>

      <ul className="mt-4 flex flex-col gap-3 border-b border-ink-100 pb-4">
        {lineItems.map((item) => (
          <li key={item.productId} className="flex gap-3">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
              <Image src={item.coverImage} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-medium text-ink-600">{item.title}</p>
              <span className="shrink-0 text-sm font-semibold text-ink-600">
                {formatPrice(item.lineTotal, item.currencyCode)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between text-ink-400">
          <span>Subtotal</span>
          <span>{currencyCode ? formatPrice(subtotal, currencyCode) : null}</span>
        </div>
        <div className="flex items-center justify-between text-ink-400">
          <span>Taxes</span>
          <span>Included where applicable</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3 font-display text-lg font-semibold text-ink-700">
          <span>Total</span>
          <span>{currencyCode ? formatPrice(subtotal, currencyCode) : null}</span>
        </div>
      </div>
    </div>
  );
}
