import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { GiftedReviewForm } from "@/components/admin/gifted-review-form";

export const metadata: Metadata = {
  title: "Add gifted review",
  robots: { index: false },
};

export default async function NewGiftedReviewPage() {
  const products = await prisma.product.findMany({
    where: { archivedAt: null },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <Link href="/admin/reviews" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Reviews
      </Link>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Add gifted review</h1>
      <p className="mb-6 max-w-xl text-sm text-ink-400">
        For a parent you gave a free copy to. It goes live straight away, labelled &quot;Gifted copy for an honest
        review&quot; (advertising rules require the disclosure). It earns no coupon and never takes the first-reviewer
        reward from a buyer. Enter the parent&apos;s words as they sent them.
      </p>
      <GiftedReviewForm products={products} />
    </div>
  );
}
