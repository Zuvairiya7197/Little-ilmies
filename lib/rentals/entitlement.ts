import { prisma } from "@/lib/db/prisma";

/**
 * The single authorization check for rental reader access. Every request
 * that serves protected book content — the reader page and the page-image
 * API route alike — must go through this, never infer entitlement from
 * anything the client sends (rental id, expiry, price, status).
 *
 * Access requires all of: a paid order (order.status === "PAID" — a
 * refunded or otherwise reversed order is automatically excluded here,
 * see fulfill-order.ts / admin refund action), an unexpired rental for
 * this exact product, owned by this exact user.
 */
export async function getActiveRentalEntitlement(userId: string, productId: string) {
  return prisma.rentalAccess.findFirst({
    where: {
      productId,
      rentalExpiresAt: { gt: new Date() },
      order: { userId, status: "PAID" },
    },
    include: { product: true, order: true },
    orderBy: { rentalExpiresAt: "desc" },
  });
}
