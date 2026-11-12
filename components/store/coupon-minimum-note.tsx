"use client";

import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { formatPrice } from "@/lib/utils/format";
import type { CouponMinimums } from "@/lib/settings/coupon-settings";

/** " of ₹500 or more" (as in "your next order of ₹500 or more") in the
 * shopper's own currency. Client-side because the page is cached for every
 * region. */
export function CouponMinimumNote({ minimums }: { minimums: CouponMinimums }) {
  const currency = useCurrencyStore((s) => s.currency);
  const hasHydrated = useCurrencyStore((s) => s.hasHydrated);
  const minimum = minimums[currency];
  // Before the visitor's currency is known the store holds a fallback (USD),
  // which would flash "$15" to Indian shoppers.
  if (!hasHydrated || !minimum) return null;
  return <> of {formatPrice(minimum, currency)} or more</>;
}
