"use client";

import { Info } from "lucide-react";
import { useCurrencyStore, selectHasRegionMismatch } from "@/lib/store/use-currency-store";

/**
 * Silent by design: renders nothing unless the backend-verified checkout
 * region actually differs from the browsing-region currency the customer
 * saw while shopping. There is no proactive/persistent pricing disclaimer —
 * only this one message, only on a genuine mismatch.
 */
export function RegionMismatchNotice() {
  const hasMismatch = useCurrencyStore(selectHasRegionMismatch);

  if (!hasMismatch) return null;

  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-xl bg-sage-50 px-3.5 py-2.5 text-xs leading-relaxed text-sage-800"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Your checkout region is different from your browsing region, so the price has been updated.
    </p>
  );
}
