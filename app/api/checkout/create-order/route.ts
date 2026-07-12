import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/auth/get-session";
import { createOrderRequestSchema } from "@/lib/validation/checkout";
import { resolveProductPriceFromDb } from "@/lib/pricing/resolve-price-db";
import { resolveVerifiedCurrency } from "@/lib/pricing/verify-region";
import { createRazorpayOrder, getRazorpayClient } from "@/lib/payments/razorpay";

/**
 * Creates an Order (status PENDING) with a server-computed total, then a
 * matching Razorpay order. The amount charged is never taken from the
 * request body — every line is re-priced here from ProductPrice using a
 * backend-verified region. See README "Checkout pricing contract".
 */
export async function POST(request: NextRequest) {
  // Fail fast, before touching the database, if payments aren't configured
  // yet — avoids leaving orphaned PENDING orders with no Payment row.
  try {
    getRazorpayClient();
  } catch {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to .env." },
      { status: 502 }
    );
  }

  const parsed = createOrderRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { buyerName, buyerEmail, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, status: "PUBLISHED" },
  });

  const missing = items.filter((i) => !products.some((p) => p.id === i.productId));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "One or more products are unavailable", productIds: missing.map((m) => m.productId) },
      { status: 422 }
    );
  }

  const currency = resolveVerifiedCurrency(request);

  let subtotal = 0;
  const orderItemsData: { productId: string; unitPrice: number; quantity: number }[] = [];

  for (const item of items) {
    const resolved = await resolveProductPriceFromDb(item.productId, currency);
    const unitPrice = resolved.salePrice ?? resolved.regularPrice;
    subtotal += unitPrice * item.quantity;
    orderItemsData.push({ productId: item.productId, unitPrice, quantity: item.quantity });
  }

  // Digital goods only — no shipping/tax logic beyond a flat 0 for now,
  // matching the "no shipping calculation" requirement. Coupons apply here
  // once the admin coupon system (Phase 6) exists.
  const discountAmount = 0;
  const taxAmount = 0;
  const totalAmount = subtotal - discountAmount + taxAmount;

  const session = await getAuthSession();
  const userId = session?.user?.id;

  const order = await prisma.order.create({
    data: {
      userId,
      buyerName,
      buyerEmail,
      currencyCode: currency,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      status: "PENDING",
      items: { create: orderItemsData },
    },
  });

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amount: totalAmount,
      currencyCode: currency,
      receipt: order.id,
    });
  } catch {
    // Local order already exists at this point — mark it FAILED rather
    // than leaving it dangling as PENDING with no Payment row.
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Could not create payment order." }, { status: 502 });
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "RAZORPAY",
      providerOrderId: razorpayOrder.id,
      amount: totalAmount,
      currencyCode: currency,
      status: "CREATED",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: totalAmount,
    currencyCode: currency,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  });
}
