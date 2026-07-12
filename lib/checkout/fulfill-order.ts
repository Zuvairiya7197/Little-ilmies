import { prisma } from "@/lib/db/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";

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
    include: { items: true },
  });
  if (!order) return;

  if (order.status === "PAID") return; // already fulfilled — no-op

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
    ...order.items.map((item) =>
      prisma.download.upsert({
        where: { orderId_productId: { orderId: order.id, productId: item.productId } },
        update: {},
        create: { orderId: order.id, productId: item.productId },
      })
    ),
  ]);

  await sendOrderConfirmationEmail(order.id).catch((err) => {
    // Email failure must never undo a verified payment — log and move on.
    console.error("Failed to send order confirmation email:", err);
  });
}
