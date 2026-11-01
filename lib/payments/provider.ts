export type PaymentProviderId = "razorpay" | "cashfree";

/**
 * Which provider takes new payments. Set PAYMENT_PROVIDER to "cashfree" to
 * switch; anything else, including unset, stays on Razorpay. This only
 * affects new orders — both providers' confirmation routes stay live, so a
 * payment already in progress still completes after a switch.
 */
export function getPaymentProvider(): PaymentProviderId {
  return process.env.PAYMENT_PROVIDER === "cashfree" ? "cashfree" : "razorpay";
}
