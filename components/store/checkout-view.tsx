"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckoutForm } from "@/components/store/checkout-form";
import { CheckoutOrderSummary } from "@/components/store/checkout-order-summary";
import { CheckoutStepProgress } from "@/components/store/checkout-step-progress";
import { RegionMismatchNotice } from "@/components/store/region-mismatch-notice";
import { useCartLineItems } from "@/hooks/use-cart-line-items";

export function CheckoutView() {
  const lineItems = useCartLineItems();
  const [mobilePhase, setMobilePhase] = useState<"details" | "payment">("details");

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
    <div className="container-content pb-32 pt-6 xs:pt-8 md:pb-16 md:pt-10">
      {/* Mobile & tablet: lock icon + subtitle + step tracker, matches app-style checkout design */}
      <div className="mb-6 md:hidden">
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-600">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          Checkout
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">Almost there! Review your details and place your order.</p>

        <div className="mt-6">
          <CheckoutStepProgress activeStep={mobilePhase === "payment" ? 2 : 1} />
        </div>
      </div>

      <h1 className="mb-4 hidden font-display text-2xl font-semibold text-ink-700 md:block xs:text-3xl">
        Checkout
      </h1>

      <div className="mb-6">
        <RegionMismatchNotice />
      </div>

      <div className="md:flex md:flex-row-reverse md:items-start md:gap-10">
        <div className="order-2 mt-6 hidden md:order-none md:mt-0 md:block md:w-96 md:shrink-0">
          <CheckoutOrderSummary />
        </div>
        <div className="order-1 min-w-0 flex-1">
          <CheckoutForm mobilePhase={mobilePhase} onMobilePhaseChange={setMobilePhase} />
        </div>
      </div>
    </div>
  );
}
