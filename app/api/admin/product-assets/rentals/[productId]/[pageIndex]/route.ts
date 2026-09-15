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
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Rental page not found" }, { status: 404 });
  }
}
