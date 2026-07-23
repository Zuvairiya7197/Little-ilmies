"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertTriangle,
  Mail,
  Tag,
  ChevronRight,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Headset,
  Heart,
  Download,
} from "lucide-react";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useRazorpayScript } from "@/hooks/use-razorpay-script";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

const paymentMethods: { id: PaymentMethod; label: string; description: string; icon: typeof Smartphone; badge?: string }[] = [
  { id: "upi", label: "UPI", description: "Pay using any UPI app", icon: Smartphone, badge: "Recommended" },
  { id: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", description: "All major banks supported", icon: Landmark },
  { id: "wallet", label: "Paytm Wallet", description: "Fast and secure payment", icon: Wallet },
];

const mobileTrustPoints = [
  { label: "Instant Download", description: "Start reading right away", icon: Download, iconColor: "text-ink-500" },
  { label: "Secure Checkout", description: "100% safe & trusted", icon: ShieldCheck, iconColor: "text-sage-600" },
  { label: "Support 24/7", description: "We're here to help", icon: Headset, iconColor: "text-teal-600" },
  { label: "Loved by Families", description: "Thousands of happy parents", icon: Heart, iconColor: "text-blossom-500" },
] as const;

export function CheckoutForm({
  mobilePhase,
  onMobilePhaseChange,
}: {
  mobilePhase: "details" | "payment";
  onMobilePhaseChange: (phase: "details" | "payment") => void;
}) {
  const router = useRouter();
  const lineItems = useCartLineItems();
  const clearCart = useCartStore((s) => s.clear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const isRazorpayReady = useRazorpayScript();

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const regularSubtotal = lineItems.reduce((sum, i) => sum + i.regularUnitPrice * i.quantity, 0);
  const savings = Math.max(0, regularSubtotal - subtotal);
  const currencyCode = lineItems[0]?.currencyCode;
  const isInrCheckout = currencyCode === "INR";
  const availablePaymentMethods = isInrCheckout
    ? paymentMethods
    : paymentMethods.filter((method) => method.id === "card");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (!availablePaymentMethods.some((method) => method.id === paymentMethod)) {
      setPaymentMethod(availablePaymentMethods[0]?.id ?? "card");
    }
  }, [availablePaymentMethods, paymentMethod]);

  function goToPayment() {
    onMobilePhaseChange("payment");
  }

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

      const selectedPaymentMethod = createData.currencyCode === "INR" ? paymentMethod : "card";

      const razorpay = new window.Razorpay({
        key: createData.razorpayKeyId,
        amount: createData.amount,
        currency: createData.currencyCode,
        order_id: createData.razorpayOrderId,
        name: "Little Ilmies",
        description: "Digital e-book purchase",
        prefill: { name: values.fullName, email: values.email },
        theme: { color: "#4B449D" },
        // Narrows Razorpay's own checkout modal to the method the shopper
        // picked on our Payment step, rather than showing every tab.
        method: {
          netbanking: selectedPaymentMethod === "netbanking",
          card: selectedPaymentMethod === "card",
          upi: selectedPaymentMethod === "upi",
          wallet: selectedPaymentMethod === "wallet",
        },
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
      {/* Contact Information — single registered instance shared by both breakpoints
          (two DOM inputs bound to the same react-hook-form field name would fight
          over which one's value wins at validation time), just restyled per size. */}
      <div className={cn("rounded-3xl bg-cream-50 p-5 shadow-clay-sm", mobilePhase === "payment" && "hidden")}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-700">
            <span>Contact Information</span>
          </h2>
          <Link href="/login" className="shrink-0 text-sm text-ink-400">
            Already have an account? <span className="font-semibold text-blossom-600">Login</span>
          </Link>
        </div>

        <div className="relative mt-4">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
            className="store-input rounded-2xl pl-11"
            placeholder="Email address"
          />
        </div>
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1.5 text-xs text-gold-700">
            {errors.email.message}
          </p>
        )}

        <div className="mt-3">
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
            className="store-input rounded-2xl"
            placeholder="Full name"
          />
        </div>
        {errors.fullName && (
          <p id="fullName-error" role="alert" className="mt-1.5 text-xs text-gold-700">
            {errors.fullName.message}
          </p>
        )}

        <label className="mt-3 flex items-center gap-2.5 text-sm text-ink-500">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-ink-200 text-ink-600" />
          Email me order updates and offers
        </label>
      </div>

      {/* Mobile & tablet: Order Items, matches app-style checkout design */}
      {mobilePhase === "details" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink-700">Order Items ({lineItems.length})</h2>
              <Link href="/cart" className="shrink-0 text-sm font-semibold text-blossom-600">
                Edit Cart
              </Link>
            </div>

            <ul className="mt-3 flex flex-col divide-y divide-ink-100">
              {lineItems.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3">
                  <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                    <Image src={item.coverImage} alt="" fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-ink-700">{item.title}</p>
                    <p className="mt-0.5 text-sm text-ink-400">{formatPrice(item.unitPrice, item.currencyCode)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-cream-100 px-3 py-1.5 text-xs font-semibold text-ink-500">
                    Qty: {item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="tap-target mt-3 flex w-full items-center justify-between gap-2 border-t border-ink-100 pt-3 text-sm font-semibold text-blossom-600"
            >
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Have a coupon code?
              </span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile & tablet: Payment phase — method picker + order summary + trust points, matches app-style checkout design */}
      {mobilePhase === "payment" && (
        <div className="flex flex-col gap-6">
          {savings > 0 && (
            <div className="flex items-center gap-4 rounded-3xl bg-sage-50 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-50 text-sage-700 shadow-soft">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-sage-800">
                You&apos;re saving {formatPrice(savings, currencyCode)} on this order!
              </p>
            </div>
          )}

          <div className="rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
            <h2 className="font-display text-lg font-bold text-ink-700">Payment Methods</h2>
            <div className="mt-3 flex flex-col gap-3">
              {availablePaymentMethods.map(({ id, label, description, icon: Icon, badge }) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition-colors",
                    paymentMethod === id ? "border-ink-500 bg-ink-50/40" : "border-transparent bg-cream-100"
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="h-4 w-4 shrink-0 text-ink-600"
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-50 text-ink-500 shadow-soft">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-700">{label}</span>
                      {badge && (
                        <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sage-700">
                          {badge}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-ink-400">{description}</span>
                  </span>
                </label>
              ))}
            </div>

            {!isInrCheckout && (
              <p className="mt-3 rounded-2xl bg-ink-50 px-3.5 py-3 text-xs font-semibold text-ink-500">
                International orders are processed by card for {currencyCode ?? "your selected currency"} checkout.
              </p>
            )}

            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-sage-50 p-3.5 text-xs font-semibold text-sage-800">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              100% Secure Payments — your payment details are safe with us.
            </div>
          </div>

          <div className="rounded-3xl bg-cream-50 p-5 shadow-clay-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink-700">Order Summary</h2>
              <span className="text-sm font-semibold text-blossom-600">{lineItems.length} Items</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3 text-sm">
              <div className="flex items-center justify-between text-ink-400">
                <span>Subtotal</span>
                <span>{currencyCode ? formatPrice(regularSubtotal, currencyCode) : null}</span>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between text-blossom-600">
                  <span>Discount</span>
                  <span>- {formatPrice(savings, currencyCode)}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3 font-display text-lg font-semibold text-ink-700">
                <span>Total Amount</span>
                <span>{currencyCode ? formatPrice(subtotal, currencyCode) : null}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl bg-cream-50 p-4 shadow-clay-sm">
            {mobileTrustPoints.map(({ label, description, icon: Icon, iconColor }) => (
              <div key={label} className="flex items-start gap-2">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight text-ink-600">{label}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-ink-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <div
        style={{ bottom: "var(--mobile-nav-height)" }}
        className="fixed inset-x-0 z-40 flex items-center gap-3 border-t border-ink-100 bg-cream-50/95 px-4 py-3 shadow-lifted backdrop-blur lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:w-[min(42rem,calc(100%-3rem))] lg:-translate-x-1/2 lg:justify-center lg:rounded-3xl lg:border lg:px-5"
      >
        <div className="min-w-0 shrink-0 lg:w-40">
          <p className="text-xs text-ink-300">Total Amount</p>
          <p className="font-display text-lg font-bold text-ink-700">
            {currencyCode ? formatPrice(subtotal, currencyCode) : ""}
          </p>
          {savings > 0 && (
            <p className="text-xs font-semibold text-sage-600">
              You save {formatPrice(savings, currencyCode)}
            </p>
          )}
        </div>
        {mobilePhase === "details" ? (
          <button
            type="button"
            onClick={handleSubmit(goToPayment)}
            disabled={lineItems.length === 0}
            className="btn-primary min-w-0 flex-1 disabled:opacity-60 lg:max-w-md"
          >
            Continue to Payment
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || lineItems.length === 0}
            className="btn-primary min-w-0 flex-1 disabled:opacity-60 lg:max-w-md"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Lock className="h-4 w-4" aria-hidden="true" />
                Pay Securely {currencyCode ? formatPrice(subtotal, currencyCode) : ""}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
