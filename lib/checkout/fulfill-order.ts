import { prisma } from "@/lib/db/prisma";
import { linkGuestOrdersToUser } from "@/lib/db/orders";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { sendCouponOveruseAlert } from "@/lib/email/send-review-emails";
import { findCouponOveruse } from "@/lib/coupons/apply-coupon";
import { FORMAT_SOURCE_SELECT, primaryPdfFormat } from "@/lib/product-formats";
import { isPdfFormat } from "@/lib/formats";
import { RENTAL_DURATION_DAYS } from "@/lib/rentals/config";
import type { Prisma } from "@prisma/client";

/**
 * Idempotent: safe to call from both the client-side verify-payment route
 * and the payment webhooks for the same order without double-fulfilling
 * (duplicate Download rows, duplicate confirmation emails). All call sites
 * converge here so an order is never marked PAID
 * twice — see README "Checkout pricing contract".
 */
export async function fulfillOrder({
  orderId,
  paymentId,
  providerPaymentId,
  providerSignature,
}: {
  orderId: string;
  paymentId: string;
  providerPaymentId: string;
  providerSignature?: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      coupon: { select: { code: true, maxRedemptions: true } },
      items: {
        include: {
          customSelections: { include: { product: { select: FORMAT_SOURCE_SELECT } } },
          product: { select: { rentalDurationDays: true } },
        },
      },
    },
  });
  if (!order) return;

  // Only an unpaid order can become paid. PAID is already fulfilled, and a
  // REFUNDED order must never come back — payment signatures don't expire,
  // so an old confirmation replayed after a refund would otherwise restore
  // the buyer's access.
  if (order.status !== "PENDING" && order.status !== "FAILED") return;

  // A guest checkout whose email already belongs to a verified account
  // goes straight to that account, so a buyer still signed in elsewhere
  // sees it without signing in again. Emails with no account yet are
  // linked on their first sign-in instead (see lib/auth/config.ts).
  if (!order.userId) {
    const owner = await prisma.user.findFirst({
      where: { email: { equals: order.buyerEmail.trim(), mode: "insensitive" }, emailVerified: { not: null } },
      select: { id: true },
    });
    if (owner) {
      await linkGuestOrdersToUser(owner.id, order.buyerEmail);
      order.userId = owner.id;
    }
  }

  const accessWrites: ((db: Prisma.TransactionClient) => Promise<unknown>)[] = [];

  for (const item of order.items) {
    if (item.itemType === "RENTAL" && item.productId) {
      // Rent & Read only ever creates a time-limited reading entitlement —
      // never a Download row. Renting again while a rental is still active
      // extends it from its current expiry instead of overlapping it.
      const rentalStartedAt = new Date();
      const activeRental = order.userId
        ? await prisma.rentalAccess.findFirst({
            where: {
              productId: item.productId,
              rentalExpiresAt: { gt: rentalStartedAt },
              order: { userId: order.userId, status: "PAID" },
            },
            orderBy: { rentalExpiresAt: "desc" },
            select: { rentalExpiresAt: true },
          })
        : null;
      const rentalExpiresAt = new Date(activeRental?.rentalExpiresAt ?? rentalStartedAt);
      rentalExpiresAt.setDate(rentalExpiresAt.getDate() + (item.product?.rentalDurationDays ?? RENTAL_DURATION_DAYS));

      const productId = item.productId;
      accessWrites.push((db) =>
        db.rentalAccess.upsert({
          where: {
            orderId_productId: { orderId: order.id, productId },
          },
          update: {},
          create: {
            orderId: order.id,
            productId,
            rentalStartedAt,
            rentalExpiresAt,
          },
        }),
      );
      continue;
    }

    // Each download grants exactly one PDF format. Bundled books get their
    // primary format (the one the bundle was priced with).
    const grants =
      item.itemType === "CUSTOM_BUNDLE"
        ? item.customSelections.map((selection) => ({
            productId: selection.productId,
            format: primaryPdfFormat(selection.product) ?? "COLOUR_PDF",
          }))
        : item.productId
          ? [{ productId: item.productId, format: isPdfFormat(item.format) ? item.format : "COLOUR_PDF" }]
          : [];

    for (const { productId, format } of grants) {
      accessWrites.push((db) =>
        db.download.upsert({
          where: { orderId_productId_format: { orderId: order.id, productId, format } },
          update: {},
          create: { orderId: order.id, productId, format },
        }),
      );
    }
  }

  // One transaction that first claims the order (unpaid → PAID). When the
  // browser confirmation and the webhook arrive together, only one claims
  // it; the other does nothing, so access and the coupon are granted once.
  // The coupon is used up only while it has uses left — a buyer who paid two
  // checkouts with one code still gets the second order (the money is taken),
  // but the shop is alerted to the over-use below.
  const claimed = await prisma.$transaction(
    async (tx) => {
      const claim = await tx.order.updateMany({
        where: { id: order.id, status: { in: ["PENDING", "FAILED"] } },
        data: { status: "PAID" },
      });
      if (claim.count === 0) return false;

      if (order.couponId) {
        await tx.coupon.updateMany({
          where: {
            id: order.couponId,
            ...(order.coupon?.maxRedemptions != null ? { redemptionCount: { lt: order.coupon.maxRedemptions } } : {}),
          },
          data: { redemptionCount: { increment: 1 } },
        });
      }
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "VERIFIED", providerPaymentId, providerSignature, verifiedAt: new Date() },
      });
      for (const write of accessWrites) await write(tx);
      return true;
    },
    // Large bundles mean many download rows.
    { timeout: 20_000 }
  );
  if (!claimed) return;

  const overuse = order.couponId ? await findCouponOveruse(order.couponId, order.id) : null;
  if (overuse && order.coupon) {
    await sendCouponOveruseAlert({
      reason: overuse,
      code: order.coupon.code,
      orderId: order.id,
      buyerEmail: order.buyerEmail,
      discount: order.discountAmount,
      currencyCode: order.currencyCode,
    }).catch((err) => console.error("Failed to send coupon over-use alert:", err));
  }

  await sendOrderConfirmationEmail(order.id).catch((err) => {
    // Email failure must never undo a verified payment — log and move on.
    console.error("Failed to send order confirmation email:", err);
  });
}
