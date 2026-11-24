"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarRange, Loader2, Plus, Trash2 } from "lucide-react";
import type { BookSaleMode, PricingSettings } from "@/lib/settings/pricing-settings";

type WindowRow = { name: string; start: string; end: string; discountPercentage: string };

const MODE_OPTIONS: { value: BookSaleMode; label: string; hint: string }[] = [
  { value: "ALWAYS", label: "Always on", hint: "Every book is on sale every day." },
  {
    value: "SCHEDULED",
    label: "Seasonal schedule",
    hint: "The sale turns on and off by itself on the dates below (midnight, India time). Between sales, books sell at their regular price.",
  },
  { value: "OFF", label: "Off", hint: "No book sale. Every book sells at its regular price." },
];

function formatDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(start: string, end: string) {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
}

export function PricingSettingsForm({ settings }: { settings: PricingSettings }) {
  const router = useRouter();
  const [bookSaleDiscountPercentage, setBookSaleDiscountPercentage] = useState(
    String(settings.configuredBookSaleDiscountPercentage)
  );
  const [customBundleDiscountPercentage, setCustomBundleDiscountPercentage] = useState(
    String(settings.customBundleDiscountPercentage)
  );
  const [bookSaleMode, setBookSaleMode] = useState<BookSaleMode>(settings.bookSaleMode);
  const [windows, setWindows] = useState<WindowRow[]>(
    settings.saleWindows.map((w) => ({
      name: w.name,
      start: w.start,
      end: w.end,
      discountPercentage: w.discountPercentage == null ? "" : String(w.discountPercentage),
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const yearDays = windows
    .filter((w) => w.start && w.end && w.start <= w.end)
    .reduce((sum, w) => sum + daysBetween(w.start, w.end), 0);

  function updateWindow(index: number, patch: Partial<WindowRow>) {
    setWindows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

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
          bookSaleMode,
          saleWindows: windows,
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

  const active = settings.activeSale;
  const status =
    settings.bookSaleMode === "OFF"
      ? "No book sale is running."
      : active
        ? active.name
          ? `${active.name} is running now (${active.discountPercentage}% off) until ${formatDay(active.endsOn!)}.`
          : `The book sale is always on (${active.discountPercentage}% off).`
        : "No sale is running today. Books sell at their regular price until the next sale.";

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-3xl p-5" noValidate>
      <h2 className="font-display text-base font-semibold text-ink-600">Pricing</h2>
      <p className="mt-1 text-sm text-ink-400">
        These percentages calculate current sale prices. Existing paid orders keep their original charged amounts.
      </p>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="block w-48">
          <span className="mb-1.5 block text-sm font-semibold text-ink-600">Book sale discount (%)</span>
          <input
            id="book-sale-discount"
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
            id="custom-bundle-discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={customBundleDiscountPercentage}
            onChange={(event) => setCustomBundleDiscountPercentage(event.target.value)}
            className="admin-input"
          />
          <span className="mt-1 block text-xs text-ink-400">Bundles keep this discount all year.</span>
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="flex items-center gap-2 text-sm font-semibold text-ink-600">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          When is the book sale on?
        </legend>
        <p className="mt-1 rounded-lg bg-sage-50 px-3 py-2 text-sm text-sage-700">{status}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {MODE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm ${
                bookSaleMode === option.value ? "border-ink-500 bg-cream-50" : "border-ink-100"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-ink-600">
                <input
                  type="radio"
                  name="bookSaleMode"
                  value={option.value}
                  checked={bookSaleMode === option.value}
                  onChange={() => setBookSaleMode(option.value)}
                  className="accent-ink-500"
                />
                {option.label}
              </span>
              <span className="mt-1 block text-xs text-ink-400">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {bookSaleMode === "SCHEDULED" && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink-600">Sale dates</p>
          <p className="mt-1 text-xs text-ink-400">
            First and last day both included. Leave the discount empty to use the book sale discount above. Islamic dates
            depend on the moon, so check them each year. Total: {yearDays} sale days
            {yearDays > 150 ? " (more than 5 months: keep regular prices as the usual price for UK rules)" : ""}.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="text-left text-xs font-bold uppercase text-ink-400">
                <tr>
                  <th className="py-1.5 pr-2">Sale name</th>
                  <th className="py-1.5 pr-2">Starts</th>
                  <th className="py-1.5 pr-2">Ends</th>
                  <th className="py-1.5 pr-2">Discount %</th>
                  <th className="py-1.5" aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {windows.map((row, index) => (
                  <tr key={index}>
                    <td className="py-1 pr-2">
                      <input
                        id={`sale-name-${index}`}
                        aria-label="Sale name"
                        value={row.name}
                        onChange={(e) => updateWindow(index, { name: e.target.value })}
                        className="admin-input h-9"
                        placeholder="Ramadan & Eid Sale"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        id={`sale-start-${index}`}
                        aria-label="First day"
                        type="date"
                        value={row.start}
                        onChange={(e) => updateWindow(index, { start: e.target.value })}
                        className="admin-input h-9"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        id={`sale-end-${index}`}
                        aria-label="Last day"
                        type="date"
                        value={row.end}
                        onChange={(e) => updateWindow(index, { end: e.target.value })}
                        className="admin-input h-9"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        id={`sale-discount-${index}`}
                        aria-label="Discount for this sale"
                        type="number"
                        min="1"
                        max="90"
                        step="0.01"
                        value={row.discountPercentage}
                        onChange={(e) => updateWindow(index, { discountPercentage: e.target.value })}
                        className="admin-input h-9 w-24"
                        placeholder={bookSaleDiscountPercentage}
                      />
                    </td>
                    <td className="py-1">
                      <button
                        type="button"
                        onClick={() => setWindows((rows) => rows.filter((_, i) => i !== index))}
                        className="tap-target rounded-lg p-2 text-ink-400 hover:bg-gold-50 hover:text-gold-700"
                        aria-label={`Remove ${row.name || "this sale"}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => setWindows((rows) => [...rows, { name: "", start: "", end: "", discountPercentage: "" }])}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a sale
          </button>
        </div>
      )}

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
