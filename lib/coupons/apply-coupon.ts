import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCouponMinimums } from "@/lib/settings/coupon-settings";
import { formatPrice } from "@/lib/utils/format";
import { normalizeEmail } from "@/lib/coupons/normalize-email";
import { CURRENCIES, type CurrencyCode } from "@/types/pricing";

export class CouponError extends Error {}

/** The minimum order for coupons in this currency, in minor units. */
export async function couponMinimumFor(currencyCode: string) {
  if (!(currencyCode in CURRENCIES)) return 0;
  return (await getCouponMinimums())[currencyCode as CurrencyCode];
}

/**
 * Looks up a coupon a buyer typed at checkout and checks it can be used by
 * this email on an order of this subtotal (minor units, after sale prices)
 * in this currency. Throws CouponError with a buyer-facing message otherwise.
 */
export async function findUsableCoupon(
  code: string,
  buyerEmail: string,
  currencyCode: string,
  subtotal: number,
  userId?: string
): Promise<Coupon> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) throw new CouponError("This coupon code isn't valid.");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new CouponError("This coupon has expired.");
  if (coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions) {
    throw new CouponError("This coupon has already been used.");
  }
  const buyer = normalizeEmail(buyerEmail);
  if (coupon.restrictedToEmail && normalizeEmail(coupon.restrictedToEmail) !== buyer) {
    throw new CouponError("This coupon belongs to a different email address. Use the email it was sent to.");
  }
  // Every coupon works once per customer, however many total uses it has.
  // Matched on the signed-in account and on the inbox behind the email, so
  // "+tag" or Gmail-dot variants of one address don't count as new people.
  const paidOrders = await prisma.order.findMany({
    where: { couponId: coupon.id, status: "PAID" },
    select: { buyerEmail: true, userId: true },
  });
  if (paidOrders.some((order) => (userId && order.userId === userId) || normalizeEmail(order.buyerEmail) === buyer)) {
    throw new CouponError("You've already used this coupon.");
  }
  // Fixed-amount coupons are entered in rupees in the admin, so they only
  // make sense on INR orders.
  if (coupon.type === "FIXED_AMOUNT" && currencyCode !== "INR") {
    throw new CouponError("This coupon can only be used on orders paid in INR.");
  }
  const minimum = await couponMinimumFor(currencyCode);
  if (subtotal < minimum) {
    const currency = currencyCode as CurrencyCode;
    throw new CouponError(
      `Coupons work on orders of ${formatPrice(minimum, currency)} or more. Add ${formatPrice(minimum - subtotal, currency)} more to use this code.`
    );
  }
  return coupon;
}

/**
 * After an order paid with a coupon, why that broke the coupon's limits,
 * or null. Catches a buyer who opened two checkouts at once and paid both.
 * Counts real paid orders, so the same order confirmed twice (webhook and
 * browser at once) isn't mistaken for over-use.
 */
export async function findCouponOveruse(couponId: string, orderId: string) {
  const [coupon, paidOrders] = await Promise.all([
    prisma.coupon.findUnique({ where: { id: couponId }, select: { maxRedemptions: true } }),
    prisma.order.findMany({
      where: { couponId, status: "PAID" },
      select: { id: true, buyerEmail: true, userId: true },
    }),
  ]);
  const order = paidOrders.find((o) => o.id === orderId);
  if (!coupon || !order) return null;

  const buyer = normalizeEmail(order.buyerEmail);
  const sameCustomer = paidOrders.some(
    (o) => o.id !== orderId && ((order.userId && o.userId === order.userId) || normalizeEmail(o.buyerEmail) === buyer)
  );
  if (sameCustomer) return "the same customer had already used it";
  if (coupon.maxRedemptions !== null && paidOrders.length > coupon.maxRedemptions) {
    return `it allows ${coupon.maxRedemptions} use${coupon.maxRedemptions === 1 ? "" : "s"} and has now been paid for ${paidOrders.length} times`;
  }
  return null;
}

/**
 * Before confirming a bank transfer order that has a coupon: whether the
 * coupon was used up elsewhere while the buyer was arranging the transfer
 * (e.g. they also paid online with it). Null when it's fine to confirm.
 */
export async function findCouponConflict(couponId: string, orderId: string) {
  const [coupon, order, otherPaid] = await Promise.all([
    prisma.coupon.findUnique({ where: { id: couponId }, select: { code: true, maxRedemptions: true, redemptionCount: true } }),
    prisma.order.findUnique({ where: { id: orderId }, select: { buyerEmail: true, userId: true } }),
    prisma.order.findMany({
      where: { couponId, status: "PAID", id: { not: orderId } },
      select: { buyerEmail: true, userId: true },
    }),
  ]);
  if (!coupon || !order) return null;

  const buyer = normalizeEmail(order.buyerEmail);
  if (otherPaid.some((o) => (order.userId && o.userId === order.userId) || normalizeEmail(o.buyerEmail) === buyer)) {
    return `Coupon ${coupon.code} was already used by this customer on another paid order.`;
  }
  if (coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions) {
    return `Coupon ${coupon.code} has already been used up on other orders.`;
  }
  return null;
}
