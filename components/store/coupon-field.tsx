"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, Loader2, Tag, X } from "lucide-react";

const PENDING_COUPON_KEY = "little-ilmies:pending-coupon";

/** Keeps a code typed in the cart so checkout can pick it up. */
export function savePendingCouponCode(code: string) {
  try {
    sessionStorage.setItem(PENDING_COUPON_KEY, code.trim().toUpperCase());
  } catch {}
}

export interface AppliedCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  /** Minimum order (minor units) in this checkout's currency. */
  minimum: number;
}

/** Checks a coupon against the buyer's email for the checkout preview. The
 * server applies it again when the order is created. */
export function CouponField({
  applied,
  onApply,
  getEmail,
  currencyCode,
  subtotal,
}: {
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon | null) => void;
  getEmail: () => string;
  currencyCode: string | undefined;
  subtotal: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A code entered in the cart opens here ready to apply.
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_COUPON_KEY);
      if (pending) {
        setCode(pending);
        setIsOpen(true);
      }
    } catch {}
  }, []);

  async function apply() {
    const email = getEmail().trim();
    if (!email) {
      setError("Enter your email above first — reward coupons only work with the email they were sent to.");
      return;
    }
    if (!code.trim() || !currencyCode) return;

    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email, currencyCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "This coupon code isn't valid.");
        return;
      }
      onApply(data as AppliedCoupon);
      setCode("");
      try {
        sessionStorage.removeItem(PENDING_COUPON_KEY);
      } catch {}
    } catch {
      setError("Could not check the coupon. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  if (applied) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-sage-700">
          <Check className="h-4 w-4" aria-hidden="true" />
          <span className="font-mono">{applied.code}</span> applied
        </span>
        <button
          type="button"
          onClick={() => onApply(null)}
          className="tap-target flex items-center gap-1 text-xs font-semibold text-ink-400 hover:text-ink-600"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Remove
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="tap-target mt-3 flex w-full items-center justify-between gap-2 border-t border-ink-100 pt-3 text-sm font-semibold text-blossom-600"
      >
        <span className="flex items-center gap-2">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Have a coupon code?
        </span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="mt-3 border-t border-ink-100 pt-3">
      <label htmlFor="couponCode" className="flex items-center gap-2 text-sm font-semibold text-blossom-600">
        <Tag className="h-4 w-4" aria-hidden="true" />
        Coupon code
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="couponCode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            // Enter would otherwise submit the whole checkout form.
            if (e.key === "Enter") {
              e.preventDefault();
              void apply();
            }
          }}
          autoComplete="off"
          autoCapitalize="characters"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "coupon-error" : undefined}
          className="store-input min-w-0 flex-1 rounded-2xl font-mono uppercase"
          placeholder="e.g. FIRST-AB12CD"
        />
        <button
          type="button"
          onClick={apply}
          disabled={isChecking || !code.trim()}
          className="btn-secondary shrink-0 rounded-2xl px-4 disabled:opacity-60"
        >
          {isChecking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Apply"}
        </button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="mt-1.5 text-xs text-gold-700">
          {error}
        </p>
      )}
    </div>
  );
}
