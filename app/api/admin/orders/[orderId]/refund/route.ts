import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * Marks an order refunded. This is the sole revocation lever for both
 * rental and download access: every entitlement check in the app (the
 * rental reader, the download route, My Rentals, My Downloads) filters on
 * order.status === "PAID", so flipping status away from PAID here is
 * immediately sufficient to revoke access — no separate rental-status
 * field to keep in sync. The order and its RentalAccess/Download rows are
 * never deleted, so order history stays intact.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { orderId } = await params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Only a paid order can be refunded" }, { status: 400 });
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });

  return NextResponse.json({ status: "REFUNDED" });
}
