import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/auth/get-session";
import { createOrderRequestSchema } from "@/lib/validation/checkout";
import { resolveProductPriceFromDb } from "@/lib/pricing/resolve-price-db";
import { resolveVerifiedCurrency } from "@/lib/pricing/verify-region";
import { createRazorpayOrder, getRazorpayClient } from "@/lib/payments/razorpay";
import { validateCustomBundleSelection } from "@/lib/bundles/custom-bundle";
import { isRentalEligibleRequest } from "@/lib/rentals/eligibility";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import { calculateRentalPrice } from "@/lib/rentals/pricing";
import type { Prisma } from "@prisma/client";

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

  const hasRentalItems = items.some((item) => item.type === "RENTAL");
  const hasUpgradeItems = items.some((item) => item.type === "UPGRADE");
  const hasNonRentalItems = items.some((item) => item.type !== "RENTAL");
  if (hasRentalItems && hasNonRentalItems) {
    return NextResponse.json(
      { error: "Please check out Rent & Read books separately from purchases." },
      { status: 422 }
    );
  }
  if (hasRentalItems && !isRentalEligibleRequest(request)) {
    return NextResponse.json(
      { error: "Rent & Read is currently available only for customers in India." },
      { status: 403 }
    );
  }

  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (hasUpgradeItems && !userId) {
    return NextResponse.json({ error: "Please log in to upgrade a rental." }, { status: 401 });
  }

  const productItems = items.filter((item) => item.type !== "CUSTOM_BUNDLE");
  const products = await prisma.product.findMany({
    where: { id: { in: productItems.map((i) => i.productId) }, status: "PUBLISHED", archivedAt: null },
  });

  const missing = productItems.filter((i) => !products.some((p) => p.id === i.productId));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "One or more products are unavailable", productIds: missing.map((m) => m.productId) },
      { status: 422 }
    );
  }

  const unrentable = items.filter(
    (item) =>
      item.type === "RENTAL" &&
      !products.find(
        (p) => p.id === item.productId && p.rentAndReadEnabled && p.rentalPageImagePaths.length > 0
      )
  );
  if (unrentable.length > 0) {
    return NextResponse.json(
      { error: "Rent & Read is not available for one or more of these books yet." },
      { status: 422 }
    );
  }

  const currency = hasRentalItems ? RENTAL_CURRENCY_CODE : resolveVerifiedCurrency(request);

  let subtotal = 0;
  const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of items) {
    if (item.type === "CUSTOM_BUNDLE") {
      let customBundle;
      try {
        customBundle = await validateCustomBundleSelection({
          bundleId: item.bundleId,
          quantity: item.quantity,
          selectedProductIds: item.selectedProductIds,
          currency,
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Invalid custom bundle" },
          { status: 422 }
        );
      }

      subtotal += customBundle.unitPrice;
      orderItemsData.push({
        bundle: { connect: { id: customBundle.bundleId } },
        itemType: "CUSTOM_BUNDLE",
        unitPrice: customBundle.unitPrice,
        quantity: 1,
        bundleSnapshot: {
          bundleId: customBundle.bundleId,
          bundleName: customBundle.bundleName,
          quantity: customBundle.quantity,
          currencyCode: currency,
          finalPrice: customBundle.unitPrice,
          selectedBooks: customBundle.selectedProducts.map((product) => ({
            id: product.id,
            slug: product.slug,
            title: product.title,
            coverImage: product.coverImage,
          })),
        },
        customSelections: {
          create: customBundle.selectedProducts.map((product) => ({
            bundle: { connect: { id: customBundle.bundleId } },
            product: { connect: { id: product.id } },
          })),
        },
      });
      continue;
    }

    let resolved: Awaited<ReturnType<typeof resolveProductPriceFromDb>>;
    try {
      resolved = await resolveProductPriceFromDb(item.productId, currency);
    } catch {
      return NextResponse.json(
        { error: `This product does not have an active ${currency} or international price configured yet.` },
        { status: 422 }
      );
    }
    const unitPrice = resolved.salePrice ?? resolved.regularPrice;
    if (item.type === "RENTAL") {
      const rentalPrice = calculateRentalPrice(unitPrice);
      subtotal += rentalPrice;
      orderItemsData.push({
        product: { connect: { id: item.productId } },
        itemType: "RENTAL",
        unitPrice: rentalPrice,
        quantity: 1,
      });
      continue;
    }

    if (item.type === "UPGRADE") {
      // userId is guaranteed by the hasUpgradeItems check above.
      const activeRental = await prisma.rentalAccess.findFirst({
        where: {
          productId: item.productId,
          rentalExpiresAt: { gt: new Date() },
          order: { userId, status: "PAID" },
        },
        include: { order: { include: { items: true } } },
        orderBy: { rentalExpiresAt: "desc" },
      });
      const rentalOrderItem = activeRental?.order.items.find(
        (orderItem) => orderItem.productId === item.productId && orderItem.itemType === "RENTAL"
      );
      if (!activeRental || !rentalOrderItem) {
        return NextResponse.json(
          { error: "No active rental found for this book to upgrade." },
          { status: 422 }
        );
      }
      const alreadyOwns = await prisma.download.findFirst({
        where: { productId: item.productId, order: { userId, status: "PAID" } },
        select: { id: true },
      });
      if (alreadyOwns) {
        return NextResponse.json({ error: "You already own this ebook." }, { status: 422 });
      }

      const upgradePrice = Math.max(0, unitPrice - rentalOrderItem.unitPrice);
      subtotal += upgradePrice;
      orderItemsData.push({
        product: { connect: { id: item.productId } },
        itemType: "PRODUCT",
        unitPrice: upgradePrice,
        quantity: 1,
      });
      continue;
    }

    subtotal += unitPrice * item.quantity;
    orderItemsData.push({
      product: { connect: { id: item.productId } },
      itemType: "PRODUCT",
      unitPrice,
      quantity: item.quantity,
    });
  }

  // Digital goods only — no shipping/tax logic beyond a flat 0 for now,
  // matching the "no shipping calculation" requirement. Coupons apply here
  // once the admin coupon system (Phase 6) exists.
  const discountAmount = 0;
  const taxAmount = 0;
  const totalAmount = subtotal - discountAmount + taxAmount;

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
