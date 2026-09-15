"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { PricingSettings } from "@/lib/settings/pricing-settings";

export function PricingSettingsForm({ settings }: { settings: PricingSettings }) {
  const router = useRouter();
  const [bookSaleDiscountPercentage, setBookSaleDiscountPercentage] = useState(
    String(settings.bookSaleDiscountPercentage)
  );
  const [customBundleDiscountPercentage, setCustomBundleDiscountPercentage] = useState(
    String(settings.customBundleDiscountPercentage)
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
      const res = await fetch("/api/admin/settings/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSaleDiscountPercentage,
          customBundleDiscountPercentage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save pricing settings.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save pricing settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-xl p-5" noValidate>
      <h2 className="font-display text-base font-semibold text-ink-600">Pricing</h2>
      <p className="mt-1 text-sm text-ink-400">
        These percentages calculate current sale prices. Existing paid orders keep their original charged amounts.
      </p>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="block w-48">
          <span className="mb-1.5 block text-sm font-semibold text-ink-600">Book sale discount (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={bookSaleDiscountPercentage}
            onChange={(event) => setBookSaleDiscountPercentage(event.target.value)}
            className="admin-input"
          />
        </label>
        <label className="block w-48">
          <span className="mb-1.5 block text-sm font-semibold text-ink-600">Custom bundle discount (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={customBundleDiscountPercentage}
            onChange={(event) => setCustomBundleDiscountPercentage(event.target.value)}
            className="admin-input"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {saved && <p className="mt-4 text-sm font-semibold text-sage-700">Pricing settings saved.</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save pricing settings"}
      </button>
    </form>
  );
}
