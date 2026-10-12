import { prisma } from "@/lib/db/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { FORMAT_SOURCE_SELECT, primaryPdfFormat } from "@/lib/product-formats";
import { isPdfFormat } from "@/lib/formats";
import { RENTAL_DURATION_DAYS } from "@/lib/rentals/config";
import type { Prisma } from "@prisma/client";

/**
 * Idempotent: safe to call from both the client-side verify-payment route
 * and the Razorpay webhook handler for the same order without
 * double-fulfilling (duplicate Download rows, duplicate confirmation
 * emails). Both call sites converge here so an order is never marked PAID
 * twice — see README "Checkout pricing contract".
 */
export async function fulfillOrder({
  orderId,
  paymentId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  orderId: string;
  paymentId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          customSelections: { include: { product: { select: FORMAT_SOURCE_SELECT } } },
          product: { select: { rentalDurationDays: true } },
        },
      },
    },
  });
  if (!order) return;

  if (order.status === "PAID") return; // already fulfilled — no-op

  const accessWrites: Prisma.PrismaPromise<unknown>[] = [];

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

      accessWrites.push(
        prisma.rentalAccess.upsert({
          where: {
            orderId_productId: { orderId: order.id, productId: item.productId },
          },
          update: {},
          create: {
            orderId: order.id,
            productId: item.productId,
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
      accessWrites.push(
        prisma.download.upsert({
          where: { orderId_productId_format: { orderId: order.id, productId, format } },
          update: {},
          create: { orderId: order.id, productId, format },
        }),
      );
    }
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "VERIFIED",
        providerPaymentId: razorpayPaymentId,
        providerSignature: razorpaySignature,
        verifiedAt: new Date(),
      },
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
    ...accessWrites,
  ]);

  await sendOrderConfirmationEmail(order.id).catch((err) => {
    // Email failure must never undo a verified payment — log and move on.
    console.error("Failed to send order confirmation email:", err);
  });
}
