import type { Metadata } from "next";
import Link from "next/link";
import { findDuplicateUploadCandidates } from "@/lib/rentals/duplicate-uploads";
import { DedupeCandidateCard } from "@/components/admin/dedupe-candidate-card";

export const metadata: Metadata = {
  title: "Rent & Read Cleanup",
  robots: { index: false },
};

export default async function RentAndReadCleanupPage() {
  const candidates = await findDuplicateUploadCandidates();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Rent &amp; Read Cleanup
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-400">
        Books where every free-preview page is a byte-for-byte duplicate of a Rent &amp; Read page — usually
        from uploading the same pages twice before you could reuse one set for the other. Review each one and
        remove the redundant preview upload; nothing is deleted automatically.
      </p>

      {candidates.length === 0 ? (
        <div className="card-surface p-8 text-center text-sm text-ink-300">
          No redundant uploads found. Every product&apos;s preview pages are either unique or don&apos;t
          overlap with its Rent &amp; Read pages.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {candidates.map((candidate) => (
            <DedupeCandidateCard key={candidate.productId} candidate={candidate} />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-ink-300">
        Looking for a specific book instead?{" "}
        <Link href="/admin/products" className="font-semibold text-sage-700 hover:underline">
          Go to Products
        </Link>
        .
      </p>
    </div>
  );
}
