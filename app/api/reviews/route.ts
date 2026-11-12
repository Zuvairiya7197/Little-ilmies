import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/auth/get-session";
import { canUserReviewProduct, findRewardableOrderId, userOwnsProduct } from "@/lib/reviews/eligibility";
import { reviewFormSchema } from "@/lib/validation/review";
import { sendNewReviewNotification } from "@/lib/email/send-review-emails";

/** The signed-in buyer's review state for one book: whether they may review
 * it, their own review (any status) and, once approved, their reward code.
 * Fetched in the browser because the product page is cached for everyone. */
export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const [canReview, owns, rewardableOrderId, review] = await Promise.all([
    canUserReviewProduct(session.user.id, productId),
    userOwnsProduct(session.user.id, productId),
    findRewardableOrderId(session.user.id, productId),
    prisma.review.findUnique({
      where: { productId_userId: { productId, userId: session.user.id } },
      include: { rewardCoupon: true },
    }),
  ]);

  const coupon = review?.rewardCoupon;
  return NextResponse.json(
    {
      canReview,
      // Why a new review here wouldn't earn a code, if it wouldn't.
      noRewardReason: !owns ? "rental" : rewardableOrderId ? null : "order-rewarded",
      defaultName: session.user.name ?? "",
      review: review
        ? {
            status: review.status,
            rating: review.rating,
            authorName: review.authorName,
            title: review.title ?? "",
            body: review.body,
            reward:
              coupon && coupon.isActive
                ? {
                    code: coupon.code,
                    percentage: coupon.value,
                    expiresAt: coupon.expiresAt?.toISOString() ?? null,
                    used: coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions,
                  }
                : null,
          }
        : null,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

/** Submits (or resubmits, while not yet approved) the buyer's review. It
 * goes to the admin queue and only appears once approved. */
export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in to write a review." }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = reviewFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { productId, rating, authorName, title, body } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
    select: { title: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }
  if (!(await canUserReviewProduct(userId, productId))) {
    return NextResponse.json(
      { error: "Only families who bought or rented this book can review it." },
      { status: 403 }
    );
  }

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { status: true },
  });
  // An approved review has already earned its reward, so it is final.
  if (existing?.status === "APPROVED") {
    return NextResponse.json({ error: "You've already reviewed this book." }, { status: 409 });
  }

  const data = { rating, authorName, title: title ?? null, body, status: "PENDING" as const };
  // Conditional on "not approved" in the write itself, so an edit landing
  // the instant the admin approves can't swap the text or reopen the review.
  if (existing) {
    const updated = await prisma.review.updateMany({
      where: { productId, userId, status: { not: "APPROVED" } },
      data,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "You've already reviewed this book." }, { status: 409 });
    }
  } else {
    try {
      await prisma.review.create({ data: { ...data, productId, userId } });
    } catch (error) {
      // Two submissions at once: the unique (productId, userId) keeps one.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ error: "Your review was already sent." }, { status: 409 });
      }
      throw error;
    }
  }

  // Only new reviews (or ones resent after a reject) notify the shop —
  // re-saving a pending review over and over must not burn the daily email
  // quota that sign-in links and order confirmations share.
  if (!existing || existing.status === "REJECTED") {
    await sendNewReviewNotification({ bookTitle: product.title, authorName, rating, body }).catch((err) => {
      console.error("Failed to send new review notification:", err);
    });
  }

  return NextResponse.json({ status: "PENDING" }, { status: existing ? 200 : 201 });
}
