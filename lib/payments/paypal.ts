/**
 * PayPal (via Razorpay) can't collect every currency we price in — AED in
 * particular. Buyers in those currencies pay by card first, and only if the
 * card fails can they opt into PayPal, charged at our USD price instead.
 * Shared by the checkout form and app/api/checkout/create-order.
 */
export const PAYPAL_UNSUPPORTED_CURRENCIES: ReadonlySet<string> = new Set(["AED"]);
export const PAYPAL_FALLBACK_CURRENCY = "USD";

export function isPaypalSupportedCurrency(currencyCode: string | null | undefined) {
  return Boolean(currencyCode) && currencyCode !== "INR" && !PAYPAL_UNSUPPORTED_CURRENCIES.has(currencyCode!);
}
