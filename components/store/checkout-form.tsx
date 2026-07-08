"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";

export function CheckoutForm() {
  const router = useRouter();
  const lineItems = useCartLineItems();
  const clearCart = useCartStore((s) => s.clear);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const currencyCode = lineItems[0]?.currencyCode;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  async function onSubmit(values: CheckoutFormValues) {
    setIsSubmitting(true);
    try {
      // Placeholder for Phase 5: POST buyer details + cart to
      // /api/checkout/create-order, which creates a Razorpay order using
      // backend-verified regional pricing (never this page's displayed
      // total) and returns a Razorpay order id to open the payment sheet.
      // On successful payment, the server verifies the signature/webhook,
      // creates the order + download access, then this page redirects to
      // /payment-success. For now this simulates that redirect so the UI
      // flow can be reviewed end to end.
      await new Promise((resolve) => setTimeout(resolve, 600));
      clearCart();
      router.push(`/payment-success?email=${encodeURIComponent(values.email)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="card-surface p-5">
        <h2 className="font-display text-lg font-semibold text-ink-700">Your Details</h2>
        <p className="mt-1 text-sm text-ink-400">
          No account needed — we&apos;ll email your download links here.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-ink-600">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              {...register("fullName")}
              className="tap-target w-full rounded-xl border border-ink-100 bg-cream-50 px-4 text-base text-ink-600 placeholder:text-ink-300 focus:border-sage-400 focus:outline-none"
              placeholder="Amina Khan"
            />
            {errors.fullName && (
              <p id="fullName-error" role="alert" className="mt-1.5 text-xs text-gold-700">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink-600">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
              className="tap-target w-full rounded-xl border border-ink-100 bg-cream-50 px-4 text-base text-ink-600 placeholder:text-ink-300 focus:border-sage-400 focus:outline-none"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-gold-700">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card-surface p-5">
        <p className="section-eyebrow mb-3">Payment method</p>
        <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800">
          Razorpay — Cards, UPI, Netbanking &amp; Wallets
        </div>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-400">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sage-600" aria-hidden="true" />
            256-bit encrypted, PCI-DSS compliant checkout
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-sage-600" aria-hidden="true" />
            We never store your card details
          </li>
        </ul>
      </div>

      {/* Desktop submit; mobile uses the sticky bottom bar instead */}
      <button
        type="submit"
        disabled={isSubmitting || lineItems.length === 0}
        className="btn-primary hidden w-full disabled:opacity-60 md:flex"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          `Pay ${currencyCode ? formatPrice(subtotal, currencyCode) : ""}`
        )}
      </button>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-cream-50/95 px-4 py-3 shadow-lifted backdrop-blur md:hidden">
        <button
          type="submit"
          disabled={isSubmitting || lineItems.length === 0}
          className="btn-primary w-full disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            `Pay ${currencyCode ? formatPrice(subtotal, currencyCode) : ""}`
          )}
        </button>
      </div>
    </form>
  );
}
