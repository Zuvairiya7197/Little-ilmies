"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckoutForm } from "@/components/store/checkout-form";
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
    <div className="container-content pb-32 pt-6 xs:pt-8 md:pt-10">
      {/* Mobile & tablet: lock icon + subtitle + step tracker, matches app-style checkout design */}
      <div className="mx-auto mb-6 max-w-2xl">
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

      <div className="mx-auto mb-6 max-w-2xl">
        <RegionMismatchNotice />
      </div>

      <div className="mx-auto max-w-2xl">
        <CheckoutForm mobilePhase={mobilePhase} onMobilePhaseChange={setMobilePhase} />
      </div>
    </div>
  );
}
