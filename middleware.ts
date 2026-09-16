import { NextResponse, type NextRequest } from "next/server";

const COUNTRY_COOKIE = "li_detected_country";

export function middleware(request: NextRequest) {
  // Forwarded so the root layout can skip the storefront header/footer/
  // mobile nav for /admin routes without a large route-group refactor —
  // next/headers has no direct pathname access in a layout otherwise.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const existing = request.cookies.get(COUNTRY_COOKIE);
  if (existing) return response;

  const country =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? null;

  if (country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
