"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertTriangle, Check, Clock, Copy, Gift, Loader2, PenLine, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ReviewRewardSettings } from "@/lib/settings/review-reward-settings";
import type { CouponMinimums } from "@/lib/settings/coupon-settings";
import { CouponMinimumNote } from "@/components/store/coupon-minimum-note";

interface OwnReview {
  status: "PENDING" | "APPROVED" | "REJECTED";
  rating: number;
  authorName: string;
  title: string;
  body: string;
  reward: { code: string; percentage: number; expiresAt: string | null; used: boolean } | null;
}

interface ReviewState {
  canReview: boolean;
  /** Set when an approved review wouldn't earn a code: only rented, or the
   * order this book came in has already earned its one code. */
  noRewardReason: "rental" | "order-rewarded" | null;
  defaultName: string;
  review: OwnReview | null;
}

const cardClass = "rounded-2xl border border-ink-100 bg-cream-50 p-5 shadow-soft";
const MIN_BODY_LENGTH = 20;

/** The signed-in buyer's side of a book's reviews: the form, their pending
 * review, or their reward code once it's approved. */
export function ReviewForm({
  productId,
  rewards,
  firstRewardOpen,
  couponMinimums,
}: {
  productId: string;
  rewards: ReviewRewardSettings;
  firstRewardOpen: boolean;
  couponMinimums: CouponMinimums;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const [state, setState] = useState<ReviewState | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((res) => (res.ok ? (res.json() as Promise<ReviewState>) : null))
      .then((data) => {
        if (data && !cancelled) setState(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [status, productId]);

  if (status === "unauthenticated") {
    return (
      <div className={cardClass}>
        <p className="text-sm text-ink-500">Bought or rented this book? Sign in to write your review.</p>
        <Link href={`/login?callbackUrl=${encodeURIComponent(`${pathname}#reviews`)}`} className="btn-primary mt-4 w-full">
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Sign in to review
        </Link>
      </div>
    );
  }

  if (!state) {
    return (
      <div className={cn(cardClass, "flex justify-center")}>
        <Loader2 className="h-5 w-5 animate-spin text-ink-300" aria-label="Loading" />
      </div>
    );
  }

  const { review } = state;
  const hasReward =
    !state.noRewardReason && ((firstRewardOpen ? rewards.firstReviewRewardPercentage : 0) > 0 || rewards.rewardPercentage > 0);

  if (review?.status === "APPROVED") {
    return (
      <div className={cardClass}>
        <p className="flex items-center gap-2 font-display text-base font-bold text-sage-700">
          <Check className="h-5 w-5" aria-hidden="true" />
          Your review is live
        </p>
        <p className="mt-1 text-sm text-ink-500">JazakAllahu khairan for helping other families choose.</p>
        {review.reward && <RewardCode reward={review.reward} couponMinimums={couponMinimums} />}
      </div>
    );
  }

  if (review?.status === "PENDING" && !isEditing) {
    return (
      <div className={cardClass}>
        <p className="flex items-center gap-2 font-display text-base font-bold text-ink-700">
          <Clock className="h-5 w-5 text-gold-600" aria-hidden="true" />
          Thanks! Your review is being checked
        </p>
        <p className="mt-1 text-sm text-ink-500">
          It will appear here once approved
          {hasReward ? `, and we'll email your discount code then` : ""}.
        </p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="tap-target mt-2 text-sm font-semibold text-blossom-600"
        >
          Edit my review
        </button>
      </div>
    );
  }

  if (!state.canReview) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-ink-500">
          Reviews are open to families who bought or rented this book, so every review is from a real reader.
        </p>
      </div>
    );
  }

  return (
    <ReviewFormFields
      productId={productId}
      initial={review}
      defaultName={state.defaultName}
      rewards={rewards}
      firstRewardOpen={firstRewardOpen}
      noRewardReason={state.noRewardReason}
      onSubmitted={(submitted) => {
        setState({ ...state, review: { ...submitted, status: "PENDING", reward: null } });
        setIsEditing(false);
      }}
    />
  );
}

function ReviewFormFields({
  productId,
  initial,
  defaultName,
  rewards,
  firstRewardOpen,
  noRewardReason,
  onSubmitted,
}: {
  productId: string;
  initial: OwnReview | null;
  defaultName: string;
  rewards: ReviewRewardSettings;
  firstRewardOpen: boolean;
  noRewardReason: ReviewState["noRewardReason"];
  onSubmitted: (review: Pick<OwnReview, "rating" | "authorName" | "title" | "body">) => void;
}) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [authorName, setAuthorName] = useState(initial?.authorName ?? defaultName);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setError("Choose a star rating.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, authorName, title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your review. Please try again.");
        return;
      }
      onSubmitted({ rating, authorName, title, body });
    } catch {
      setError("Could not send your review. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cardClass} noValidate>
      <h3 className="font-display text-base font-bold text-ink-700">
        {initial ? "Edit your review" : "Write a review"}
      </h3>
      {initial?.status === "REJECTED" && (
        <p className="mt-1 text-xs text-gold-700">
          Your last review wasn&apos;t published. Please keep it about the book and send it again.
        </p>
      )}
      {!initial &&
        (noRewardReason === null ? (
          <RewardNote rewards={rewards} firstRewardOpen={firstRewardOpen} />
        ) : (
          <p className="mt-1 text-xs text-ink-400">
            {noRewardReason === "rental"
              ? "Discount rewards are for families who bought the book."
              : "The order this book came in has already earned its discount code (one code per order). Your review still helps other families!"}
          </p>
        ))}

      <fieldset className="mt-4">
        <legend className="mb-1 text-sm font-semibold text-ink-600">Your rating</legend>
        <div className="flex" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((stars) => (
            <label
              key={stars}
              className="tap-target flex cursor-pointer items-center justify-center rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink-300"
              onMouseEnter={() => setHovered(stars)}
            >
              <input
                type="radio"
                name="rating"
                value={stars}
                checked={rating === stars}
                onChange={() => setRating(stars)}
                className="sr-only"
              />
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  stars <= (hovered || rating) ? "fill-gold-400 text-gold-400" : "fill-ink-100 text-ink-100"
                )}
                aria-hidden="true"
              />
              <span className="sr-only">
                {stars} {stars === 1 ? "star" : "stars"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-semibold text-ink-600">Your review</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={2000}
          className="store-input rounded-2xl"
          placeholder="What did your child enjoy? What did they learn?"
        />
        <span className={cn("mt-1 block text-right text-xs", body.trim().length < MIN_BODY_LENGTH ? "text-ink-300" : "text-sage-700")}>
          {body.trim().length < MIN_BODY_LENGTH
            ? `${MIN_BODY_LENGTH - body.trim().length} more characters needed`
            : `${body.length}/2000`}
        </span>
      </label>

      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-semibold text-ink-600">
          Headline <span className="font-normal text-ink-300">(optional)</span>
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="store-input rounded-2xl"
          placeholder="e.g. My daughter asks for it every night"
        />
      </label>

      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-semibold text-ink-600">Name to show</span>
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={40}
          autoComplete="given-name"
          className="store-input rounded-2xl"
          placeholder="e.g. Umm Yusuf, Mumbai"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-4 w-full disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Submit review"}
      </button>
    </form>
  );
}

/** The first-reviewer reward goes to whichever review is approved first, so
 * while a book has none the buyer is told both amounts, not promised the
 * bigger one. */
function RewardNote({ rewards, firstRewardOpen }: { rewards: ReviewRewardSettings; firstRewardOpen: boolean }) {
  const { firstReviewRewardPercentage: first, rewardPercentage: other } = rewards;
  const text =
    firstRewardOpen && first > 0
      ? other > 0 && other !== first
        ? `The first approved buyer review earns ${first}% off a future order — later reviews earn ${other}%`
        : `The first approved buyer review earns ${first}% off a future order`
      : other > 0
        ? `Earn ${other}% off your next order once it's approved`
        : null;
  if (!text) return null;

  return (
    <p className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-gold-700">
      <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {text} (one code per order)
    </p>
  );
}

function RewardCode({
  reward,
  couponMinimums,
}: {
  reward: NonNullable<OwnReview["reward"]>;
  couponMinimums: CouponMinimums;
}) {
  const [copied, setCopied] = useState(false);
  const expiresAt = reward.expiresAt ? new Date(reward.expiresAt) : null;
  const isExpired = expiresAt !== null && expiresAt < new Date();

  if (reward.used || isExpired) {
    return (
      <p className="mt-3 text-xs text-ink-400">
        Your {reward.percentage}% reward code <span className="font-mono">{reward.code}</span> has{" "}
        {reward.used ? "been used" : "expired"}.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl bg-gold-50 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-gold-700">
        <Gift className="h-4 w-4" aria-hidden="true" />
        Your {reward.percentage}% off code
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="flex-1 rounded-lg bg-cream-50 px-3 py-2 text-center font-mono text-base font-bold tracking-wider text-ink-700">
          {reward.code}
        </span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(reward.code).then(() => setCopied(true));
          }}
          className="tap-target flex items-center justify-center rounded-lg text-ink-500 hover:text-ink-700"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-500">
        Use it once, on an order
        <CouponMinimumNote minimums={couponMinimums} />, with your account email
        {expiresAt ? ` — valid until ${expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}.
      </p>
    </div>
  );
}
