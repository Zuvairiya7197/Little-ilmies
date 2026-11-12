"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReviewRewardSettings } from "@/lib/settings/review-reward-settings";

export function ReviewRewardSettingsForm({ settings }: { settings: ReviewRewardSettings }) {
  const router = useRouter();
  const [rewardPercentage, setRewardPercentage] = useState(String(settings.rewardPercentage));
  const [firstReviewRewardPercentage, setFirstReviewRewardPercentage] = useState(
    String(settings.firstReviewRewardPercentage)
  );
  const [rewardValidDays, setRewardValidDays] = useState(String(settings.rewardValidDays));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings/review-rewards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardPercentage, firstReviewRewardPercentage, rewardValidDays }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save review rewards.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save review rewards. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-xl p-5" noValidate>
      <h2 className="font-display text-base font-semibold text-ink-600">Review rewards</h2>
      <p className="mt-1 text-sm text-ink-400">
        When you approve a review, the buyer gets a one-use code for this much off their next order. The first approved
        review of each book gets the bigger reward. Set a percentage to 0 to turn that reward off. Codes already sent
        keep their value.
      </p>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="block w-48">
          <span className="mb-1.5 block text-sm font-semibold text-ink-600">First reviewer (%)</span>
          <input
            type="number"
            min="0"
            max="90"
            step="1"
            value={firstReviewRewardPercentage}
            onChange={(event) => setFirstReviewRewardPercentage(event.target.value)}
            className="admin-input"
          />
        </label>
        <label className="block w-48">
          <span className="mb-1.5 block text-sm font-semibold text-ink-600">Every other review (%)</span>
          <input
            type="number"
            min="0"
            max="90"
            step="1"
            value={rewardPercentage}
            onChange={(event) => setRewardPercentage(event.target.value)}
            className="admin-input"
          />
        </label>
        <label className="block w-48">
          <span className="mb-1.5 block text-sm font-semibold text-ink-600">Code valid for (days)</span>
          <input
            type="number"
            min="1"
            max="365"
            step="1"
            value={rewardValidDays}
            onChange={(event) => setRewardValidDays(event.target.value)}
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
      {saved && <p className="mt-4 text-sm font-semibold text-sage-700">Review rewards saved.</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save review rewards"}
      </button>
    </form>
  );
}
