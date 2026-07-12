"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Lock, Loader2, AlertTriangle } from "lucide-react";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useRazorpayScript } from "@/hooks/use-razorpay-script";
import { formatPrice } from "@/lib/utils/format";

export function CheckoutForm() {
  const router = useRouter();
  const lineItems = useCartLineItems();
  const clearCart = useCartStore((s) => s.clear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isRazorpayReady = useRazorpayScript();

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
    setSubmitError(null);
    try {
      // The server re-prices every item from ProductPrice using a
      // backend-verified region — this request never sends an amount or
      // currency, only product identity. See app/api/checkout/create-order.
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: values.fullName,
          buyerEmail: values.email,
          items: lineItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        setSubmitError(createData.error ?? "Could not start checkout. Please try again.");
        return;
      }

      if (!isRazorpayReady || !window.Razorpay) {
        setSubmitError("Payment is still loading — please try again in a moment.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: createData.razorpayKeyId,
        amount: createData.amount,
        currency: createData.currencyCode,
        order_id: createData.razorpayOrderId,
        name: "Little Ilmies",
        description: "Digital e-book purchase",
        prefill: { name: values.fullName, email: values.email },
        theme: { color: "#4B449D" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: createData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            clearCart();
            router.push(`/payment-success?email=${encodeURIComponent(values.email)}`);
          } else {
            router.push("/payment-failed");
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      });

      razorpay.open();
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
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
              className="tap-target w-full rounded-xl border border-ink-100 bg-cream-50 px-4 text-base text-ink-600 placeholder:text-ink-300 focus-visible:border-sage-400"
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
              className="tap-target w-full rounded-xl border border-ink-100 bg-cream-50 px-4 text-base text-ink-600 placeholder:text-ink-300 focus-visible:border-sage-400"
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

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

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
