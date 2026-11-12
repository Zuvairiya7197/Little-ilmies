"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ConfirmBankTransferButton({
  orderId,
  amount,
  reference,
  isPastDeadline,
}: {
  orderId: string;
  amount: string;
  reference: string;
  /** Paid after the payment window — the price or coupon may have changed since. */
  isPastDeadline: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmReceived() {
    const lateNote = isPastDeadline
      ? "\n\nThis order is past its payment window, so its price and any coupon may be out of date."
      : "";
    const checkNote = "\n\nCheck your bank account itself — never a screenshot alone.";
    if (!window.confirm(`Confirm you received ${amount} with reference ${reference}? The buyer's books unlock immediately.${lateNote}${checkNote}`)) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      let res = await send(false);
      if (res.status === 409) {
        const body = await res.json().catch(() => null);
        if (!body?.couponConflict || !window.confirm(`${body.error}\n\nThe buyer paid the discounted price. Confirm anyway?`)) {
          return;
        }
        res = await send(true);
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not confirm the payment");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm the payment");
    } finally {
      setIsSubmitting(false);
    }
  }

  function send(force: boolean) {
    return fetch(`/api/admin/orders/${orderId}/confirm-bank-transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force }),
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={confirmReceived}
        disabled={isSubmitting}
        className="rounded-full bg-sage-500 px-3 py-1.5 text-xs font-bold text-cream-50 transition-colors hover:bg-sage-600 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : "Mark bank transfer received"}
      </button>
      {error && <p className="mt-1.5 text-xs text-gold-700">{error}</p>}
    </div>
  );
}
