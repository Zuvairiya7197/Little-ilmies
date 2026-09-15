import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { RENTAL_COUNTRY_CODE } from "@/lib/rentals/config";

export function isRentalsCountryCode(countryCode?: string | null) {
  return countryCode?.toUpperCase() === RENTAL_COUNTRY_CODE;
}

export function isRentalEligibleRequest(request: NextRequest) {
  return isRentalsCountryCode(
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry")
  );
}

export async function isRentalEligibleFromHeaders() {
  const headerStore = await headers();
  return isRentalsCountryCode(
    headerStore.get("x-vercel-ip-country") ?? headerStore.get("cf-ipcountry")
  );
}
