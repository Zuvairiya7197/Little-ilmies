import { prisma } from "@/lib/db/prisma";
import type { CurrencyCode } from "@/types/pricing";

/** Smallest order (before the coupon, after sale prices) any coupon works
 * on, per currency, in minor units. Each is set for its own market, not
 * converted from INR — see the admin Settings page. */
export type CouponMinimums = Record<CurrencyCode, number>;

export const DEFAULT_COUPON_MINIMUMS: CouponMinimums = {
  INR: 50000,
  USD: 1500,
  GBP: 1200,
  AED: 5500,
};

const keyFor = (currency: CurrencyCode) => `COUPON_MIN_ORDER_${currency}`;
const CURRENCY_CODES = Object.keys(DEFAULT_COUPON_MINIMUMS) as CurrencyCode[];

export async function getCouponMinimums(): Promise<CouponMinimums> {
  const rows = await prisma.appSetting.findMany({ where: { key: { in: CURRENCY_CODES.map(keyFor) } } });
  const byKey = new Map(rows.map((row) => [row.key, Number(row.value)]));

  return Object.fromEntries(
    CURRENCY_CODES.map((currency) => {
      const value = byKey.get(keyFor(currency));
      return [currency, Number.isInteger(value) && value! >= 0 ? value! : DEFAULT_COUPON_MINIMUMS[currency]];
    })
  ) as CouponMinimums;
}

export async function updateCouponMinimums(minimums: CouponMinimums) {
  await prisma.$transaction(
    CURRENCY_CODES.map((currency) =>
      prisma.appSetting.upsert({
        where: { key: keyFor(currency) },
        update: { value: String(minimums[currency]) },
        create: { key: keyFor(currency), value: String(minimums[currency]) },
      })
    )
  );
}

/** "₹500 in India, or $15 / £12 / AED 55 elsewhere" — for emails, where the
 * reader's currency isn't known. */
export function describeCouponMinimums(minimums: CouponMinimums, format: (amount: number, currency: CurrencyCode) => string) {
  const others = CURRENCY_CODES.filter((c) => c !== "INR").map((c) => format(minimums[c], c));
  return `${format(minimums.INR, "INR")} in India, or ${others.join(" / ")} elsewhere`;
}
