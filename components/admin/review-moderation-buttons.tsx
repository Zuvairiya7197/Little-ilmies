"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ReviewModerationButtons({
  reviewId,
  status,
  updatedAt,
  isGifted,
}: {
  /** Gifted reviews earn no reward, so approving just publishes. */
  isGifted: boolean;
  reviewId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  /** ISO time of the version shown on the page. */
  updatedAt: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function moderate(action: "approve" | "reject") {
    if (action === "reject" && status === "APPROVED" && !window.confirm("Hide this live review? An unused reward code is switched off too.")) {
      return;
    }
    setPending(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, seenUpdatedAt: updatedAt }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not update the review");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the review");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        {status !== "APPROVED" && (
          <button
            type="button"
            onClick={() => moderate("approve")}
            disabled={pending !== null}
            className="rounded-full bg-sage-500 px-3 py-1.5 text-xs font-bold text-cream-50 transition-colors hover:bg-sage-600 disabled:opacity-50"
          >
            {pending === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : isGifted ? "Approve" : "Approve & send reward"}
          </button>
        )}
        {status !== "REJECTED" && (
          <button
            type="button"
            onClick={() => moderate("reject")}
            disabled={pending !== null}
            className="rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-bold text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50"
          >
            {pending === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : status === "APPROVED" ? "Hide" : "Reject"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-gold-700">{error}</p>}
    </div>
  );
}
