"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { DuplicateUploadCandidate } from "@/lib/rentals/duplicate-uploads";
import { productPreviewUrls, productRentalPageUrls } from "@/lib/catalog-assets";

export function DedupeCandidateCard({ candidate }: { candidate: DuplicateUploadCandidate }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Thumbnails only — actual dedupe decision is re-verified server-side
  // against current file contents, not these indexes.
  const previewUrls = productPreviewUrls(candidate.productId, candidate.previewImagePaths);
  const matchingRentalPaths = candidate.matchingRentalIndexes.map(
    (i) => candidate.rentalPageImagePaths[i]
  );
  const rentalUrls = productRentalPageUrls(candidate.productId, matchingRentalPaths);

  async function confirm() {
    if (!window.confirm(`Remove the ${candidate.previewImagePaths.length} redundant preview file(s) for "${candidate.title}"?`)) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/dedupe-preview-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: candidate.productId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not remove redundant preview files.");
        return;
      }
      setIsDone(true);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div className="card-surface p-4 text-sm text-ink-400">
        Redundant preview files removed for <span className="font-semibold text-ink-600">{candidate.title}</span>.
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/admin/products/${candidate.productId}`} className="font-display text-lg font-semibold text-ink-700 hover:underline">
            {candidate.title}
          </Link>
          <p className="mt-1 text-xs text-ink-400">
            {candidate.previewImagePaths.length} preview page
            {candidate.previewImagePaths.length === 1 ? "" : "s"} · all match pages in the{" "}
            {candidate.rentalPageImagePaths.length}-page Rent &amp; Read upload
          </p>
        </div>
        <button
          type="button"
          onClick={confirm}
          disabled={isSubmitting}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-bold text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Remove redundant preview
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Preview pages (to remove)</p>
          <ol className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {previewUrls.map((src, i) => (
              <li key={src} className="w-14 shrink-0 rounded-lg border border-gold-200 bg-cream-50 p-1">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-100">
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <p className="mt-1 text-center text-[10px] font-semibold text-ink-400">{i + 1}</p>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Matching rental pages (kept)</p>
          <ol className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {rentalUrls.map((src, i) => (
              <li key={src} className="w-14 shrink-0 rounded-lg border border-sage-200 bg-cream-50 p-1">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-100">
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <p className="mt-1 text-center text-[10px] font-semibold text-ink-400">
                  {candidate.matchingRentalIndexes[i] + 1}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-gold-700">{error}</p>}
    </div>
  );
}
