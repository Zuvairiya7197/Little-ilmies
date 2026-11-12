import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Plus, Trophy } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { StarRating } from "@/components/store/star-rating";
import { ReviewModerationButtons } from "@/components/admin/review-moderation-buttons";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false },
};

const statusTabs = [
  { status: "PENDING", label: "Waiting" },
  { status: "APPROVED", label: "Live" },
  { status: "REJECTED", label: "Rejected" },
] as const;

type ReviewStatus = (typeof statusTabs)[number]["status"];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const status: ReviewStatus = statusTabs.some((tab) => tab.status === statusParam)
    ? (statusParam as ReviewStatus)
    : "PENDING";

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: { status },
      // Oldest first while waiting, so the earliest reviewer of a book is
      // approved first and gets the first-reviewer reward.
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      take: 100,
      include: {
        product: { select: { title: true, slug: true } },
        user: { select: { email: true } },
        rewardCoupon: { select: { code: true, value: true, redemptionCount: true, isActive: true } },
      },
    }),
    prisma.review.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: ReviewStatus) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Reviews</h1>
        <Link href="/admin/reviews/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add gifted review
        </Link>
      </div>
      <p className="mb-3 text-sm text-ink-400">
        Only buyers can review. Approving a review puts it on the book page and emails the buyer a one-use discount code
        (one per order). Reward percentages are in Settings.
      </p>
      <p className="mb-6 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-700">
        <strong>Approve honest reviews even when they&apos;re negative.</strong> Reject only spam, abuse, personal
        details, or reviews not about the book. Hiding genuine criticism of a rewarded review is a misleading practice
        under Indian consumer rules (and US law for overseas buyers).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/reviews?status=${tab.status}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold shadow-clay-sm",
              tab.status === status ? "bg-ink-500 text-cream-50" : "bg-cream-50 text-ink-500 hover:bg-cream-100"
            )}
          >
            {tab.label} ({countFor(tab.status)})
          </Link>
        ))}
      </div>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${review.product.slug}#reviews`}
                  className="text-xs font-bold uppercase tracking-wide text-sage-700 hover:underline"
                >
                  {review.product.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} />
                  {review.title && <span className="font-semibold text-ink-700">{review.title}</span>}
                  {review.source === "GIFTED" && (
                    <span className="flex items-center gap-1 rounded-full bg-blossom-50 px-2 py-0.5 text-xs font-semibold text-blossom-600">
                      <Heart className="h-3 w-3" aria-hidden="true" />
                      Gifted copy
                    </span>
                  )}
                  {review.isFirstReview && review.status === "APPROVED" && (
                    <span className="flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-700">
                      <Trophy className="h-3 w-3" aria-hidden="true" />
                      First reviewer
                    </span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-500">{review.body}</p>
                <p className="mt-2 text-xs text-ink-300">
                  {review.authorName} · {review.user?.email ?? "added by you"} ·{" "}
                  {review.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {review.rewardCoupon && (
                    <>
                      {" "}· Reward <span className="font-mono">{review.rewardCoupon.code}</span> ({review.rewardCoupon.value}%,{" "}
                      {review.rewardCoupon.redemptionCount > 0 ? "used" : review.rewardCoupon.isActive ? "unused" : "switched off"})
                    </>
                  )}
                </p>
              </div>
              <ReviewModerationButtons
                reviewId={review.id}
                status={review.status}
                updatedAt={review.updatedAt.toISOString()}
                isGifted={review.source === "GIFTED"}
              />
            </li>
          ))}
          {reviews.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">
              {status === "PENDING" ? "No reviews waiting for approval." : "No reviews here yet."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
