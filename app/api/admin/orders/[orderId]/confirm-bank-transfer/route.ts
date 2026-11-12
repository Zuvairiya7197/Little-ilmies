import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { fulfillOrder } from "@/lib/checkout/fulfill-order";
import { findCouponConflict } from "@/lib/coupons/apply-coupon";
import { bankTransferReference } from "@/lib/payments/bank-transfer";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

const confirmSchema = z.object({
  /** Confirm even though the order's coupon was used up elsewhere. */
  force: z.boolean().default(false),
});

/**
 * The admin saw the money arrive: fulfils the bank transfer order exactly
 * like a verified online payment — downloads unlock, the coupon is used up
 * and the buyer gets the usual confirmation email.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { orderId } = await params;
  const parsed = confirmSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { where: { provider: "BANK_TRANSFER" } } },
  });
  const payment = order?.payments[0];
  if (!order || !payment) {
    return NextResponse.json({ error: "Bank transfer order not found" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Only an order waiting for payment can be confirmed" }, { status: 400 });
  }

  if (order.couponId && !parsed.data.force) {
    const conflict = await findCouponConflict(order.couponId, order.id);
    if (conflict) {
      return NextResponse.json({ error: conflict, couponConflict: true }, { status: 409 });
    }
  }

  await fulfillOrder({
    orderId: order.id,
    paymentId: payment.id,
    providerPaymentId: bankTransferReference(order.id),
  });

  return NextResponse.json({ status: "PAID" });
}
