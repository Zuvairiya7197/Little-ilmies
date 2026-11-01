import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyCashfreeWebhookSignature } from "@/lib/payments/cashfree";
import { fulfillOrder } from "@/lib/checkout/fulfill-order";

/**
 * Cashfree webhook — the resilient path for order fulfillment, matching
 * app/api/webhooks/razorpay/route.ts. It guarantees an order gets marked
 * PAID even if the buyer never makes it back to the return route.
 *
 * Must read the raw body (not request.json()) because the signature is
 * computed over the exact byte string Cashfree sent.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = verifyCashfreeWebhookSignature({ body: rawBody, signature, timestamp });
  } catch {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 502 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const providerOrderId = event.data?.order?.order_id;
  const cashfreePayment = event.data?.payment;

  // Cashfree's dashboard test event uses a made-up order, which lands here
  // as "no payment found" and is simply acknowledged.
  const payment = providerOrderId
    ? await prisma.payment.findFirst({ where: { provider: "CASHFREE", providerOrderId } })
    : null;

  if (payment && cashfreePayment?.payment_status === "SUCCESS" && cashfreePayment.cf_payment_id) {
    await fulfillOrder({
      orderId: payment.orderId,
      paymentId: payment.id,
      providerPaymentId: String(cashfreePayment.cf_payment_id),
    });
  }

  if (payment && payment.status !== "VERIFIED" && cashfreePayment?.payment_status === "FAILED") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ received: true });
}
