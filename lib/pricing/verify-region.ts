import type { NextRequest } from "next/server";
import { currencyFromCountryCode } from "@/lib/pricing/detect-currency";
import type { CurrencyCode } from "@/types/pricing";

/**
 * Server-side region verification for checkout — this is the actual
 * authority on price, never the client's displayed currency. Priority
 * order per README "Checkout pricing contract":
 *   1. IP-based country detection (edge header set by middleware.ts)
 *   2. Billing country supplied at checkout (once collected)
 *   3. Payment method country (Razorpay doesn't expose this pre-payment)
 *   4. Verified account country on file (profile.countryCode)
 *
 * Only (1) and (2) are wired up for now; (3)/(4) are documented extension
 * points once billing address collection and account profiles exist.
 */
export function resolveVerifiedCurrency(
  request: NextRequest,
  billingCountryCode?: string | null
): CurrencyCode {
  if (billingCountryCode) {
    return currencyFromCountryCode(billingCountryCode);
  }

  const ipCountry =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");

  return currencyFromCountryCode(ipCountry);
}
