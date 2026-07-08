"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutOrderSummary } from "@/components/store/checkout-order-summary";
import { RegionMismatchNotice } from "@/components/store/region-mismatch-notice";
import { useCartLineItems } from "@/hooks/use-cart-line-items";

export function CheckoutView() {
  const lineItems = useCartLineItems();

  if (lineItems.length === 0) {
    return (
      <div className="container-content py-6 xs:py-8 md:py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
          Checkout
        </h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some books before heading to checkout."
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
    <div className="container-content pb-28 pt-6 xs:pt-8 md:pb-16 md:pt-10">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Checkout
      </h1>

      <div className="mb-6">
        <RegionMismatchNotice />
      </div>

      <div className="md:flex md:flex-row-reverse md:items-start md:gap-10">
        <div className="md:w-96 md:shrink-0">
          <CheckoutOrderSummary />
        </div>
        <div className="mt-6 min-w-0 flex-1 md:mt-0">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}
