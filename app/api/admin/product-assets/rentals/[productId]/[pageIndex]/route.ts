import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getRentalPage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ productId: string; pageIndex: string }>;
}

/**
 * Admin-only preview of uploaded Rent & Read page images, so the admin
 * form can show a thumbnail grid. Distinct from the customer-facing
 * /api/rentals/[productId]/pages/[page] route, which requires an active
 * paid rental rather than an admin session.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { productId, pageIndex } = await params;
  const index = Number(pageIndex);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Rental page not found" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { rentalPageImagePaths: true },
  });

  const pagePath = product?.rentalPageImagePaths[index];
  if (!product || !pagePath?.startsWith("rentals/")) {
    return NextResponse.json({ error: "Rental page not found" }, { status: 404 });
  }

  try {
    const buffer = await getRentalPage(pagePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        // The URL's ?v= query param is the exact storage key, so a given
        // URL always resolves to the same bytes forever — reordering,
        // replacing, or deleting a page always changes the key, which
        // naturally busts this cache. Caching it in the requesting
        // browser only (never a shared/public cache, since this is
        // paywalled content) for a long time avoids re-downloading every
        // thumbnail from B2 on every admin page load/refresh, which was
        // needlessly eating into B2's daily download bandwidth cap —
        // opening a single product with many pages could burn through it
        // in one visit.
        "Cache-Control": "private, max-age=2592000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Rental page not found" }, { status: 404 });
  }
}
