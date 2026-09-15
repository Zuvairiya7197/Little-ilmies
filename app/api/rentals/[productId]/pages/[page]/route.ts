import { NextResponse, type NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth/get-session";
import { getActiveRentalEntitlement } from "@/lib/rentals/entitlement";
import { getRentalPage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ productId: string; page: string }>;
}

/**
 * Serves exactly one page image of a rented book — never the original
 * PDF, never the whole book in one response. Every request re-verifies
 * the rental server-side (see lib/rentals/entitlement.ts); nothing about
 * the request itself (page number, product id) is trusted for access.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { productId, page } = await params;
  const pageIndex = Number(page);
  if (!Number.isInteger(pageIndex) || pageIndex < 0) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rental = await getActiveRentalEntitlement(session.user.id, productId);
  if (!rental) {
    return NextResponse.json({ error: "No active rental access for this book" }, { status: 403 });
  }

  const pagePath = rental.product.rentalPageImagePaths[pageIndex];
  if (!pagePath) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await getRentalPage(pagePath);
  } catch {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Disposition": "inline",
    },
  });
}
