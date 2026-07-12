import Razorpay from "razorpay";
import crypto from "node:crypto";

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env."
    );
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

/**
 * Creates a Razorpay order for an amount/currency the backend has already
 * computed from ProductPrice (see app/api/checkout/create-order/route.ts).
 * Never pass a client-submitted amount here.
 */
export async function createRazorpayOrder({
  amount,
  currencyCode,
  receipt,
}: {
  amount: number; // minor units
  currencyCode: string;
  receipt: string;
}) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount,
    currency: currencyCode,
    receipt,
  });
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay returns to the client after a
 * successful checkout. This is the only thing that proves a payment
 * callback is genuine — the amount/status from the frontend must never be
 * trusted on their own. See app/api/checkout/verify-payment/route.ts.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured.");
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Verifies the signature Razorpay sends on webhook requests (distinct
 * secret from the payment-callback signature above — configured separately
 * in the Razorpay dashboard as RAZORPAY_WEBHOOK_SECRET).
 */
export function verifyWebhookSignature({
  body,
  signature,
}: {
  body: string;
  signature: string;
}): boolean {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
