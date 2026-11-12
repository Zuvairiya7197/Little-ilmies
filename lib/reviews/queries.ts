import { prisma } from "@/lib/db/prisma";
import type { ProductReview } from "@/types/catalog";

export async function getApprovedReviews(productId: string, limit = 50): Promise<ProductReview[]> {
  const reviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { approvedAt: "desc" },
    take: limit,
  });
  return reviews.map((review) => ({
    id: review.id,
    author: review.authorName,
    rating: review.rating,
    date: (review.approvedAt ?? review.createdAt).toISOString(),
    title: review.title ?? "",
    body: review.body,
    isFirstReview: review.isFirstReview,
    isGifted: review.source === "GIFTED",
  }));
}

/** Whether a buyer has already taken this book's first-reviewer reward.
 * Gifted reviews don't count, so the first real buyer can still earn it. */
export async function isFirstReviewerTaken(productId: string) {
  const first = await prisma.review.findFirst({
    where: { productId, isFirstReview: true },
    select: { id: true },
  });
  return Boolean(first);
}

/** How many approved reviews gave each star rating, across all of them. */
export async function getRatingCounts(productId: string): Promise<Record<number, number>> {
  const groups = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, status: "APPROVED" },
    _count: true,
  });
  return Object.fromEntries(groups.map((group) => [group.rating, group._count]));
}

/** Keeps Product.rating/reviewCount in step with its approved reviews. */
export async function recomputeProductRating(productId: string) {
  const { _avg, _count } = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round((_avg.rating ?? 0) * 10) / 10, reviewCount: _count },
  });
}
