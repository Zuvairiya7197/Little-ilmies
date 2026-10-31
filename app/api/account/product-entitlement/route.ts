import { NextResponse, type NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth/get-session";
import { getProductEntitlementForUser } from "@/lib/db/orders";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const entitlement = await getProductEntitlementForUser(session.user.id, productId);
  return NextResponse.json(entitlement, { headers: { "Cache-Control": "private, no-store" } });
}
