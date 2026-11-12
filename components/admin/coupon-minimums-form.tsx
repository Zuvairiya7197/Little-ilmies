"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { CouponMinimums } from "@/lib/settings/coupon-settings";
import type { CurrencyCode } from "@/types/pricing";

const fields: { currency: CurrencyCode; label: string }[] = [
  { currency: "INR", label: "India (₹)" },
  { currency: "USD", label: "International ($)" },
  { currency: "GBP", label: "UK (£)" },
  { currency: "AED", label: "UAE (AED)" },
];

export function CouponMinimumsForm({ minimums }: { minimums: CouponMinimums }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<CurrencyCode, string>>(
    () => Object.fromEntries(fields.map(({ currency }) => [currency, String(minimums[currency] / 100)])) as Record<CurrencyCode, string>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save minimum order amounts.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save minimum order amounts. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-xl p-5" noValidate>
      <h2 className="font-display text-base font-semibold text-ink-600">Coupon minimum order</h2>
      <p className="mt-1 text-sm text-ink-400">
        Every coupon (review rewards and ones you create) only works when the order — after sale prices, before the
        coupon — is at least this much. Each currency is set for its own market, not converted from rupees. Set 0 for
        no minimum.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {fields.map(({ currency, label }) => (
          <label key={currency} className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-600">{label}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values[currency]}
              onChange={(event) => setValues({ ...values, [currency]: event.target.value })}
              className="admin-input"
            />
          </label>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {saved && <p className="mt-4 text-sm font-semibold text-sage-700">Minimum order amounts saved.</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save minimum order"}
      </button>
    </form>
  );
}
