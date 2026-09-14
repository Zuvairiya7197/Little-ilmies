"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteAdminResourceButton({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setError(null);
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Could not delete ${label}.`);
        setConfirming(false);
        return;
      }
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="tap-target inline-flex items-center gap-1.5 rounded-full border border-gold-200 px-3 py-1.5 text-xs font-semibold text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-60"
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {confirming ? "Confirm" : "Delete"}
      </button>
      {error && <p className="max-w-48 text-right text-xs text-gold-700">{error}</p>}
    </div>
  );
}
