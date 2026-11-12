import { prisma } from "@/lib/db/prisma";

/** Only buyers who bought (or rented and read) a book may review it — a
 * paid order that granted them a download or a Rent & Read rental. */
export async function canUserReviewProduct(userId: string, productId: string) {
  const [owns, rental] = await Promise.all([
    userOwnsProduct(userId, productId),
    prisma.rentalAccess.findFirst({
      where: { productId, order: { userId, status: "PAID" } },
      select: { id: true },
    }),
  ]);
  return owns || Boolean(rental);
}

/** Bought the book outright (a paid download). Only this earns a review
 * reward — a cheap rental must not be a way to buy a big discount. */
export async function userOwnsProduct(userId: string, productId: string) {
  const download = await prisma.download.findFirst({
    where: { productId, order: { userId, status: "PAID" } },
    select: { id: true },
  });
  return Boolean(download);
}

/** The buyer's earliest paid order for this book that hasn't paid for a
 * review reward yet — or null once every such order has. One order, one
 * reward code, however many of its books are reviewed. */
export async function findRewardableOrderId(userId: string, productId: string) {
  const order = await prisma.order.findFirst({
    where: { userId, status: "PAID", downloads: { some: { productId } }, rewardedReview: { is: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return order?.id ?? null;
}
