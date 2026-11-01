import type { NextRequest } from "next/server";
import { isRentalsCountryCode } from "@/lib/rentals/config";
import { getRequestCountry } from "@/lib/pricing/request-country";

export function isRentalEligibleRequest(request: NextRequest) {
  return isRentalsCountryCode(getRequestCountry(request.headers));
}
