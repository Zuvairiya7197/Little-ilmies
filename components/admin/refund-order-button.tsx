"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function RefundOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund() {
    if (!window.confirm("Mark this order as refunded? This revokes the buyer's download and reading access immediately.")) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to refund order");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refund order");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRefund}
        disabled={isSubmitting}
        className="rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-bold text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : "Mark as refunded"}
      </button>
      {error && <p className="mt-1.5 text-xs text-gold-700">{error}</p>}
    </div>
  );
}
