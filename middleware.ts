import { NextResponse, type NextRequest } from "next/server";

const COUNTRY_COOKIE = "li_detected_country";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const country =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? null;

  // Refresh whenever the visitor's IP country changes (travel, new network)
  // so the displayed currency keeps matching the one checkout will charge,
  // which is always re-derived from the live IP country server-side.
  const existing = request.cookies.get(COUNTRY_COOKIE)?.value;
  if (country && country !== existing) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  // Page navigations only — the country cookie is read client-side, so
  // running this on API routes, images and static files just burns
  // serverless CPU.
  matcher: "/((?!api|_next/static|_next/image|images|.*\\..*).*)",
};
