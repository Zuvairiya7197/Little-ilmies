/** Payment providers can't take a zero amount, so a coupon always leaves at
 * least this much (minor units) to pay. */
const MIN_CHARGE = 100;

/** Discount in minor units. Shared by the checkout preview and the server's
 * order total, so what the buyer sees is what they're charged. */
export function couponDiscount(coupon: { type: "PERCENTAGE" | "FIXED_AMOUNT"; value: number }, subtotal: number) {
  const raw = coupon.type === "PERCENTAGE" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.max(0, Math.min(raw, subtotal - MIN_CHARGE));
}
