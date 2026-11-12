import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getReviewRewardSettings } from "@/lib/settings/review-reward-settings";
import { recomputeProductRating } from "@/lib/reviews/queries";
import { sendReviewRewardEmail } from "@/lib/email/send-review-emails";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { findRewardableOrderId, userOwnsProduct } from "@/lib/reviews/eligibility";
import { describeCouponMinimums, getCouponMinimums } from "@/lib/settings/coupon-settings";
import { formatPrice } from "@/lib/utils/format";

// No 0/O or 1/I, so a code read out of an email can't be mistyped.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function rewardCode(isFirstReview: boolean) {
  const suffix = Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
  return `${isFirstReview ? "FIRST" : "THANKS"}-${suffix}`;
}

/**
 * Publishes a review and issues its reward: a single-use percentage coupon
 * that only the reviewer's email can redeem. The first approved review of a
 * book gets the bigger first-reviewer percentage — once per book, ever, so
 * hiding that review never makes the next one "first" too. A reward needs a
 * paid purchase of the book (not a rental, not refunded) that hasn't already
 * paid for another review's reward: one code per order. Approving a review
 * that already has a coupon (re-approved after a reject) reactivates that
 * coupon rather than issuing a second one.
 */
export class ReviewChangedError extends Error {}

export async function approveReview(reviewId: string, seenUpdatedAt: Date) {
  // Claim the approval first, so two clicks (or two admin tabs) can't both
  // go on to issue a coupon — and only for the exact text the admin read.
  const claimed = await prisma.review.updateMany({
    where: { id: reviewId, status: { not: "APPROVED" }, updatedAt: seenUpdatedAt },
    data: { status: "APPROVED", approvedAt: new Date() },
  });
  if (claimed.count === 0) {
    const current = await prisma.review.findUnique({ where: { id: reviewId }, select: { status: true } });
    if (current && current.status !== "APPROVED") {
      throw new ReviewChangedError("The buyer edited this review after you opened the page. Refresh and read it again.");
    }
    return;
  }

  const review = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
    include: { user: { select: { email: true } }, product: { select: { title: true } } },
  });

  const [earlierFirst, stillOwns, rewardOrderId] = await Promise.all([
    prisma.review.count({
      where: { productId: review.productId, isFirstReview: true, id: { not: review.id } },
    }),
    review.userId ? userOwnsProduct(review.userId, review.productId) : false,
    review.userId && !review.rewardCouponId ? findRewardableOrderId(review.userId, review.productId) : null,
  ]);
  // "First reviewer" means earning the first-reviewer reward, so it only goes
  // to a buyer review that gets a new code: never a gifted or rental-only
  // review, nor one whose order already paid for another review's code —
  // either would use up the book's 20% with nobody receiving it.
  const isFirstReview =
    review.isFirstReview || (review.source === "BUYER" && Boolean(rewardOrderId) && earlierFirst === 0);
  const settings = await getReviewRewardSettings();
  const percentage = isFirstReview ? settings.firstReviewRewardPercentage : settings.rewardPercentage;

  let newCoupon: { id: string; code: string; value: number; expiresAt: Date | null } | null = null;
  if (review.rewardCouponId) {
    if (stillOwns) {
      await prisma.coupon.update({ where: { id: review.rewardCouponId }, data: { isActive: true } });
    }
  } else if (rewardOrderId && percentage > 0 && review.user?.email) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + settings.rewardValidDays);
    // A clash on the random code is vanishingly rare; retry a few times.
    for (let attempt = 0; attempt < 5 && !newCoupon; attempt++) {
      try {
        newCoupon = await prisma.coupon.create({
          data: {
            code: rewardCode(isFirstReview),
            type: "PERCENTAGE",
            value: percentage,
            maxRedemptions: 1,
            restrictedToEmail: review.user.email.toLowerCase(),
            expiresAt,
          },
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
      }
    }
    if (!newCoupon) throw new Error("Could not generate a unique reward coupon code");
  }

  try {
    await prisma.review.update({
      where: { id: review.id },
      data: {
        isFirstReview,
        ...(newCoupon ? { rewardCouponId: newCoupon.id, rewardOrderId } : {}),
      },
    });
  } catch (error) {
    // Another review from the same order was rewarded at the same moment
    // (rewardOrderId is unique): this one goes live without a code.
    if (!(newCoupon && error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    await prisma.coupon.delete({ where: { id: newCoupon.id } });
    newCoupon = null;
    await prisma.review.update({ where: { id: review.id }, data: { isFirstReview } });
  }
  await recomputeProductRating(review.productId);
  revalidateCatalogPaths();

  if (newCoupon && review.user?.email) {
    await sendReviewRewardEmail({
      to: review.user.email,
      bookTitle: review.product.title,
      code: newCoupon.code,
      percentage: newCoupon.value,
      expiresAt: newCoupon.expiresAt,
      isFirstReview,
      minimumOrder: describeCouponMinimums(await getCouponMinimums(), formatPrice),
    }).catch((err) => {
      // The coupon is already live and shown on the book page; a failed
      // email must not undo the approval.
      console.error("Failed to send review reward email:", err);
    });
  }
}

/** Hides a review. An unused reward coupon is switched off with it. */
export async function rejectReview(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { rewardCoupon: { select: { id: true, redemptionCount: true } } },
  });
  if (!review || review.status === "REJECTED") return;

  await prisma.review.update({ where: { id: review.id }, data: { status: "REJECTED" } });
  if (review.rewardCoupon && review.rewardCoupon.redemptionCount === 0) {
    await prisma.coupon.update({ where: { id: review.rewardCoupon.id }, data: { isActive: false } });
  }
  if (review.status === "APPROVED") {
    await recomputeProductRating(review.productId);
    revalidateCatalogPaths();
  }
}

/**
 * Called after an order is refunded. For each book in it, a buyer who no
 * longer owns the book loses their unused review reward, and one who can no
 * longer read it at all has their review hidden. Returns warnings for
 * rewards the buyer already spent, so the admin can account for them.
 */
export async function revokeReviewRewardsForRefund(orderId: string): Promise<string[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      downloads: { select: { productId: true } },
      rentals: { select: { productId: true } },
    },
  });
  if (!order?.userId) return [];
  const userId = order.userId;

  const productIds = [...new Set([...order.downloads, ...order.rentals].map((row) => row.productId))];
  const reviews = await prisma.review.findMany({
    where: { userId, productId: { in: productIds } },
    include: {
      product: { select: { title: true } },
      rewardCoupon: { include: { orders: { where: { status: "PAID" }, select: { id: true } } } },
    },
  });

  const warnings: string[] = [];
  for (const review of reviews) {
    const [stillOwns, stillRents] = await Promise.all([
      userOwnsProduct(userId, review.productId),
      prisma.rentalAccess.findFirst({
        where: { productId: review.productId, order: { userId, status: "PAID" } },
        select: { id: true },
      }),
    ]);
    if (stillOwns) continue;

    const coupon = review.rewardCoupon;
    if (coupon && coupon.redemptionCount > 0) {
      const usedOn = coupon.orders.map((o) => `#${o.id.slice(-8).toUpperCase()}`).join(", ");
      warnings.push(
        `The buyer already used ${coupon.code} (${coupon.value}% off, earned by reviewing "${review.product.title}")${usedOn ? ` on order ${usedOn}` : ""}.`
      );
    } else if (coupon?.isActive) {
      await prisma.coupon.update({ where: { id: coupon.id }, data: { isActive: false } });
    }

    if (!stillRents) await rejectReview(review.id);
  }
  return warnings;
}

/** Publishes a review a parent sent the shop after being given a free copy.
 * No account and no reward; shown with a "Gifted copy" label. */
export async function addGiftedReview(data: {
  productId: string;
  rating: number;
  authorName: string;
  title?: string;
  body: string;
}) {
  const review = await prisma.review.create({
    data: { ...data, title: data.title ?? null, source: "GIFTED", status: "APPROVED", approvedAt: new Date() },
  });
  await recomputeProductRating(data.productId);
  revalidateCatalogPaths();
  return review;
}
