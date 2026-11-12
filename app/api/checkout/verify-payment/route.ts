import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPaymentRequestSchema } from "@/lib/validation/checkout";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { fulfillOrder } from "@/lib/checkout/fulfill-order";

/**
 * Called by the client immediately after Razorpay Checkout succeeds. This
 * is NOT the sole source of truth for "payment succeeded" — the signature
 * check below cryptographically proves the callback is genuine, but the
 * webhook handler (app/api/webhooks/razorpay/route.ts) is what makes
 * fulfillment idempotent and resilient to the buyer closing their browser
 * before this request completes. Both paths converge on fulfillOrder() in
 * lib/checkout/fulfill-order.ts so an order is never marked PAID twice.
 */
export async function POST(request: NextRequest) {
  const parsed = verifyPaymentRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Razorpay payments only: a bank transfer's providerOrderId is our own
  // order id, which appears in the buyer's instructions link.
  const payment = order.payments.find((p) => p.provider === "RAZORPAY" && p.providerOrderId === razorpayOrderId);
  if (!payment) {
    return NextResponse.json({ error: "Payment record not found for this order" }, { status: 404 });
  }

  let isValid: boolean;
  try {
    isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
  } catch {
    return NextResponse.json({ error: "Payment verification is not configured" }, { status: 502 });
  }

  if (!isValid) {
    // Anyone can send a bad signature, so it may only fail an unpaid order —
    // never revoke the downloads of one that's already paid.
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { not: "VERIFIED" } },
      data: { status: "FAILED", providerPaymentId: razorpayPaymentId },
    });
    await prisma.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  await fulfillOrder({
    orderId: order.id,
    paymentId: payment.id,
    providerPaymentId: razorpayPaymentId,
    providerSignature: razorpaySignature,
  });

  return NextResponse.json({ status: "ok", orderId: order.id });
}
