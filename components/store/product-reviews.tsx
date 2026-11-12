import { BadgeCheck, Gift, Heart, Star, Trophy } from "lucide-react";
import { StarRating } from "@/components/store/star-rating";
import { ReviewForm } from "@/components/store/review-form";
import type { ProductDetail } from "@/types/catalog";
import type { ReviewRewardSettings } from "@/lib/settings/review-reward-settings";
import type { CouponMinimums } from "@/lib/settings/coupon-settings";
import { CouponMinimumNote } from "@/components/store/coupon-minimum-note";

/** Approved buyer reviews for a book, plus the reward that invites more.
 * Rendered with the cached product page; the buyer's own review state is
 * loaded in the browser by ReviewForm. */
export function ProductReviews({
  product,
  rewards,
  ratingCounts,
  couponMinimums,
  firstReviewerTaken,
}: {
  /** A buyer already earned the first-reviewer reward (gifted reviews don't count). */
  firstReviewerTaken: boolean;
  couponMinimums: CouponMinimums;
  product: Pick<ProductDetail, "id" | "rating" | "reviewCount" | "reviews">;
  rewards: ReviewRewardSettings;
  /** Approved reviews per star rating — all of them, not just those listed. */
  ratingCounts: Record<number, number>;
}) {
  const { reviews, reviewCount } = product;
  const isUnreviewed = reviewCount === 0;
  const firstRewardOpen = !firstReviewerTaken;
  const rewardPercentage = firstRewardOpen ? rewards.firstReviewRewardPercentage : rewards.rewardPercentage;
  const starCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratingCounts[stars] ?? 0,
  }));

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24">
      <h2 id="reviews-heading" className="font-display text-2xl font-bold text-ink-700">
        Reviews from parents
      </h2>

      {rewardPercentage > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-gold-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-50 text-gold-600 shadow-soft">
            {firstRewardOpen ? <Trophy className="h-5 w-5" aria-hidden="true" /> : <Gift className="h-5 w-5" aria-hidden="true" />}
          </span>
          <p className="text-sm leading-relaxed text-ink-600">
            {firstRewardOpen ? (
              <>
                <strong className="font-bold text-ink-700">
                  {isUnreviewed ? "No reviews yet — be the first!" : "Be the first buyer to review!"}
                </strong>{" "}
                Bought this book? The first approved buyer review earns{" "}
                <strong className="font-bold text-ink-700">{rewardPercentage}% off</strong> a future order
                <CouponMinimumNote minimums={couponMinimums} />.
              </>
            ) : (
              <>
                <strong className="font-bold text-ink-700">Bought this book?</strong> Share your review and get{" "}
                <strong className="font-bold text-ink-700">{rewardPercentage}% off</strong> your next order
                <CouponMinimumNote minimums={couponMinimums} />.
              </>
            )}
          </p>
        </div>
      )}

      {/* Required disclosure: rewarded reviews must say so, and the reward
          can't depend on the review being positive. */}
      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        Every review is checked before it appears, and we publish honest reviews whether they&apos;re positive or
        negative.{" "}
        {(rewards.rewardPercentage > 0 || rewards.firstReviewRewardPercentage > 0) &&
          "Buyers can receive a thank-you discount code (one per order) for an approved review, whatever its rating. "}
        Reviews marked &quot;Gifted copy&quot; are from parents we gave a free book to.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-10">
        <div className="flex flex-col gap-5">
          {!isUnreviewed && (
            <div className="rounded-2xl border border-ink-100 bg-cream-50 p-5 shadow-soft">
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-ink-700">{product.rating.toFixed(1)}</span>
                <div className="pb-1">
                  <StarRating rating={product.rating} size="md" />
                  <p className="mt-1 text-xs text-ink-400">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-1.5">
                {starCounts.map(({ stars, count }) => (
                  <li key={stars} className="flex items-center gap-2 text-xs text-ink-500">
                    <span className="flex w-7 items-center gap-0.5">
                      {stars}
                      <Star className="h-3 w-3 fill-gold-400 text-gold-400" aria-hidden="true" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <span
                        className="block h-full rounded-full bg-gold-400"
                        style={{ width: `${(count / reviewCount) * 100}%` }}
                      />
                    </span>
                    <span className="w-5 text-right">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ReviewForm
            productId={product.id}
            rewards={rewards}
            firstRewardOpen={firstRewardOpen}
            couponMinimums={couponMinimums}
          />
        </div>

        {reviews.length > 0 ? (
          <ul className="flex flex-col divide-y divide-ink-100">
            {reviews.map((review) => (
              <li key={review.id} className="py-5 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRating rating={review.rating} />
                  {review.title && <h3 className="font-display text-base font-bold text-ink-700">{review.title}</h3>}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-500">{review.body}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                  <span className="font-semibold text-ink-600">{review.author}</span>
                  {review.isGifted ? (
                    <span className="flex items-center gap-1 font-semibold text-blossom-600">
                      <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                      Gifted copy for an honest review
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-sage-700">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified buyer
                    </span>
                  )}
                  {review.isFirstReview && (
                    <span className="flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 font-semibold text-gold-700">
                      <Trophy className="h-3 w-3" aria-hidden="true" />
                      First reviewer
                    </span>
                  )}
                  <time dateTime={review.date}>
                    {new Date(review.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </time>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
            Reviews come only from families who bought or rented this book, or were given a copy to review.
          </p>
        )}
      </div>
    </section>
  );
}
