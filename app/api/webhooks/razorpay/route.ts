import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { fulfillOrder } from "@/lib/checkout/fulfill-order";

/**
 * Razorpay webhook — the resilient path for order fulfillment. The
 * client-side verify-payment route usually fires first, but this handler
 * is what guarantees an order gets marked PAID even if the buyer's
 * browser crashes or loses connection right after payment. Configure this
 * URL + RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard once keys exist.
 *
 * Must read the raw body (not request.json()) because signature
 * verification is computed over the exact byte string Razorpay sent.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = verifyWebhookSignature({ body: rawBody, signature });
  } catch {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 502 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const razorpayPayment = event.payload?.payment?.entity;
    const razorpayOrderId = razorpayPayment?.order_id;
    const razorpayPaymentId = razorpayPayment?.id;

    if (razorpayOrderId && razorpayPaymentId) {
      const payment = await prisma.payment.findFirst({
        where: { providerOrderId: razorpayOrderId },
      });

      if (payment) {
        await fulfillOrder({
          orderId: payment.orderId,
          paymentId: payment.id,
          razorpayPaymentId,
        });
      }
    }
  }

  if (event.event === "payment.failed") {
    const razorpayOrderId = event.payload?.payment?.entity?.order_id;
    if (razorpayOrderId) {
      const payment = await prisma.payment.findFirst({
        where: { providerOrderId: razorpayOrderId },
      });
      if (payment && payment.status !== "VERIFIED") {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        await prisma.order.update({ where: { id: payment.orderId }, data: { status: "FAILED" } });
      }
    }
  }

  return NextResponse.json({ received: true });
}
