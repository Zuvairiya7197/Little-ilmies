"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { StorefrontSettings } from "@/lib/settings/storefront-settings";

export function StorefrontSettingsForm({ settings }: { settings: StorefrontSettings }) {
  const router = useRouter();
  const [hardcoverComingSoonEnabled, setHardcoverComingSoonEnabled] = useState(settings.hardcoverComingSoonEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings/storefront", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hardcoverComingSoonEnabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save storefront settings.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save storefront settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-xl p-5" noValidate>
      <h2 className="font-display text-base font-semibold text-ink-600">Product page formats</h2>
      <p className="mt-1 text-sm text-ink-400">
        The hardcover card is display-only — it can never be selected, priced or bought. Individual books can
        still hide it from their product settings.
      </p>

      <label className="tap-target mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-600">
        <input
          type="checkbox"
          checked={hardcoverComingSoonEnabled}
          onChange={(event) => setHardcoverComingSoonEnabled(event.target.checked)}
          className="h-4 w-4 rounded border-ink-200 text-sage-600 focus:ring-sage-400"
        />
        Show &quot;Hardcover Book · Coming Soon&quot; on product pages
      </label>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {saved && <p className="mt-4 text-sm font-semibold text-sage-700">Storefront settings saved.</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save storefront settings"}
      </button>
    </form>
  );
}
