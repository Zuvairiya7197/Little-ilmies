import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { RENTAL_COUNTRY_CODE } from "@/lib/rentals/config";
import { getRequestCountry } from "@/lib/pricing/request-country";

export function isRentalsCountryCode(countryCode?: string | null) {
  return countryCode?.toUpperCase() === RENTAL_COUNTRY_CODE;
}

export function isRentalEligibleRequest(request: NextRequest) {
  return isRentalsCountryCode(getRequestCountry(request.headers));
}

export async function isRentalEligibleFromHeaders() {
  const headerStore = await headers();
  return isRentalsCountryCode(getRequestCountry(headerStore));
}
