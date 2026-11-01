"use client";

import { useSyncExternalStore } from "react";
import { readDetectedCountry } from "@/lib/pricing/detected-country";
import { isRentalsCountryCode } from "@/lib/rentals/config";

const subscribe = () => () => {};

/**
 * Whether this visitor can see Rent & Read, or null until the browser has
 * taken over. Read from the country cookie rather than request headers so
 * public pages stay cacheable and most visits never reach the database. It
 * only decides what to show: checkout re-checks the real request country.
 */
export function useRentalEligible() {
  return useSyncExternalStore<boolean | null>(
    subscribe,
    () => isRentalsCountryCode(readDetectedCountry()),
    () => null
  );
}
