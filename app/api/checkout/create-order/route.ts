import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/auth/get-session";
import { createOrderRequestSchema } from "@/lib/validation/checkout";
import { resolveProductPriceFromDb } from "@/lib/pricing/resolve-price-db";
import { resolveVerifiedCurrency } from "@/lib/pricing/verify-region";
import { createRazorpayOrder, getRazorpayClient } from "@/lib/payments/razorpay";
import { assertCashfreeConfigured, createCashfreeOrder, getCashfreeMode } from "@/lib/payments/cashfree";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getSiteUrl } from "@/lib/site-url";
import { PAYPAL_FALLBACK_CURRENCY, PAYPAL_UNSUPPORTED_CURRENCIES } from "@/lib/payments/paypal";
import { validateCustomBundleSelection } from "@/lib/bundles/custom-bundle";
import { isRentalEligibleRequest } from "@/lib/rentals/eligibility";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import { isFormatAvailable, rentalPriceFor } from "@/lib/product-formats";
import { formatName } from "@/lib/formats";
import { getPricingSettings } from "@/lib/settings/pricing-settings";
import { CouponError, findUsableCoupon } from "@/lib/coupons/apply-coupon";
import { couponDiscount } from "@/lib/coupons/discount";
import {
  BANK_TRANSFER_PAYMENT_DAYS,
  MAX_OPEN_BANK_TRANSFER_ORDERS,
  getBankTransferInfo,
} from "@/lib/payments/bank-transfer";
import { sendBankTransferOrderEmails } from "@/lib/email/send-bank-transfer-emails";
import type { Prisma } from "@prisma/client";

/**
 * Creates an Order (status PENDING) with a server-computed total, then a
 * matching order with the active payment provider. The amount charged is never taken from the
 * request body — every line is re-priced here from ProductPrice using a
 * backend-verified region. See README "Checkout pricing contract".
 */
export async function POST(request: NextRequest) {
  const parsed = createOrderRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { buyerName, buyerPhone, items, couponCode, paypalFallback, paymentMethod } = parsed.data;
  let { buyerEmail } = parsed.data;
  const isBankTransfer = paymentMethod === "BANK_TRANSFER";
  if (isBankTransfer && !getBankTransferInfo()) {
    return NextResponse.json({ error: "Bank transfer isn't available right now." }, { status: 422 });
  }

  // Fail fast, before touching the database, if payments aren't configured
  // yet — avoids leaving orphaned PENDING orders with no Payment row.
  const paymentProvider = getPaymentProvider();
  if (!isBankTransfer) {
    try {
      if (paymentProvider === "cashfree") assertCashfreeConfigured();
      else getRazorpayClient();
    } catch {
      return NextResponse.json(
        {
          error:
            paymentProvider === "cashfree"
              ? "Payments are not configured yet. Add CASHFREE_APP_ID/CASHFREE_SECRET_KEY to .env."
              : "Payments are not configured yet. Add RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to .env.",
        },
        { status: 502 }
      );
    }
  }

  if (!isBankTransfer && paymentProvider === "cashfree" && !buyerPhone) {
    return NextResponse.json({ error: "Please enter your mobile number." }, { status: 400 });
  }

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

  // Bank transfer orders email payment instructions, so they need a signed-
  // in buyer and always go to that account's own (verified) email — never
  // an address typed into the form, which would let anyone send our emails
  // to strangers. Open orders per account are capped for the same reason.
  if (isBankTransfer) {
    if (!userId || !session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to pay by bank transfer." }, { status: 401 });
    }
    buyerEmail = session.user.email;
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - BANK_TRANSFER_PAYMENT_DAYS);
    const openOrders = await prisma.order.count({
      where: {
        userId,
        status: "PENDING",
        createdAt: { gte: windowStart },
        payments: { some: { provider: "BANK_TRANSFER" } },
      },
    });
    if (openOrders >= MAX_OPEN_BANK_TRANSFER_ORDERS) {
      return NextResponse.json(
        {
          error:
            "You already have bank transfer orders waiting for payment. Please pay one of those (the details are in your email), or message us on WhatsApp.",
        },
        { status: 429 }
      );
    }
  }

  if (hasUpgradeItems && !userId) {
    return NextResponse.json({ error: "Please log in to upgrade a rental." }, { status: 401 });
  }

  const productItems = items.filter((item) => item.type !== "CUSTOM_BUNDLE");
  const products = await prisma.product.findMany({
    where: { id: { in: productItems.map((i) => i.productId) }, status: "PUBLISHED", archivedAt: null },
    include: { prices: true },
  });
  const pricingSettings = await getPricingSettings();

  const missing = productItems.filter((i) => !products.some((p) => p.id === i.productId));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "One or more products are unavailable", productIds: missing.map((m) => m.productId) },
      { status: 422 }
    );
  }

  // Every line must be a format this book currently offers — the same
  // rule the product page uses to decide which formats to show, so a
  // disabled or incomplete format can't be bought by editing the cart.
  for (const item of productItems) {
    const product = products.find((p) => p.id === item.productId)!;
    const format = item.type === "RENTAL" ? "RENT_AND_READ" : item.format;
    if (!isFormatAvailable(product, format, pricingSettings.bookSaleDiscountPercentage)) {
      return NextResponse.json(
        {
          error:
            format === "RENT_AND_READ"
              ? "Rent & Read is not available for one or more of these books yet."
              : `The ${formatName(format)} of "${product.title}" is no longer available. Please remove it from your cart.`,
          productIds: [item.productId],
        },
        { status: 422 }
      );
    }
  }

  const verifiedCurrency = resolveVerifiedCurrency(request);
  // A PayPal fallback only ever swaps a PayPal-unsupported currency (AED)
  // for USD; any other region keeps its own verified price.
  const currency = hasRentalItems
    ? RENTAL_CURRENCY_CODE
    : paypalFallback && PAYPAL_UNSUPPORTED_CURRENCIES.has(verifiedCurrency)
      ? PAYPAL_FALLBACK_CURRENCY
      : verifiedCurrency;

  // Bank transfer is the fallback for international buyers whose cards are
  // declined — the same buyers checkout offers it to.
  if (isBankTransfer && (hasRentalItems || currency === "INR")) {
    return NextResponse.json(
      { error: "Bank transfer is only for international orders. Please pay online." },
      { status: 422 }
    );
  }

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

    if (item.type === "RENTAL") {
      const product = products.find((p) => p.id === item.productId)!;
      // Availability above guarantees a rental price exists.
      const rentalPrice = rentalPriceFor(product, pricingSettings.bookSaleDiscountPercentage)!;
      subtotal += rentalPrice;
      orderItemsData.push({
        product: { connect: { id: item.productId } },
        itemType: "RENTAL",
        format: "RENT_AND_READ",
        unitPrice: rentalPrice,
        quantity: 1,
      });
      continue;
    }

    let resolved: Awaited<ReturnType<typeof resolveProductPriceFromDb>>;
    try {
      resolved = await resolveProductPriceFromDb(item.productId, currency, item.format);
    } catch {
      return NextResponse.json(
        { error: `This product does not have an active ${currency} or international price configured yet.` },
        { status: 422 }
      );
    }
    const unitPrice = resolved.salePrice ?? resolved.regularPrice;

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
        where: { productId: item.productId, format: item.format, order: { userId, status: "PAID" } },
        select: { id: true },
      });
      if (alreadyOwns) {
        return NextResponse.json({ error: `You already own the ${formatName(item.format)}.` }, { status: 422 });
      }

      const upgradePrice = Math.max(0, unitPrice - rentalOrderItem.unitPrice);
      subtotal += upgradePrice;
      orderItemsData.push({
        product: { connect: { id: item.productId } },
        itemType: "PRODUCT",
        format: item.format,
        unitPrice: upgradePrice,
        quantity: 1,
      });
      continue;
    }

    subtotal += unitPrice * item.quantity;
    orderItemsData.push({
      product: { connect: { id: item.productId } },
      itemType: "PRODUCT",
      format: item.format,
      unitPrice,
      quantity: item.quantity,
    });
  }

  // Digital goods only — no shipping/tax logic beyond a flat 0 for now,
  // matching the "no shipping calculation" requirement.
  let coupon = null;
  if (couponCode) {
    try {
      coupon = await findUsableCoupon(couponCode, buyerEmail, currency, subtotal, userId);
    } catch (error) {
      if (error instanceof CouponError) return NextResponse.json({ error: error.message }, { status: 422 });
      throw error;
    }
  }
  const discountAmount = coupon ? couponDiscount(coupon, subtotal) : 0;
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
      couponId: coupon?.id,
      status: "PENDING",
      items: { create: orderItemsData },
    },
  });

  // No payment provider: the order waits, coupon attached but not yet used
  // up, until an admin confirms the transfer arrived.
  if (isBankTransfer) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "BANK_TRANSFER",
        providerOrderId: order.id,
        amount: totalAmount,
        currencyCode: currency,
        status: "CREATED",
      },
    });
    await sendBankTransferOrderEmails(order.id).catch((err) => {
      console.error("Failed to send bank transfer order emails:", err);
    });
    return NextResponse.json({ orderId: order.id, provider: "bank_transfer", amount: totalAmount, currencyCode: currency });
  }

  let providerOrderId: string;
  let checkout;
  try {
    if (paymentProvider === "cashfree") {
      const siteUrl = getSiteUrl();
      const cashfreeOrder = await createCashfreeOrder({
        orderId: order.id,
        amount: totalAmount,
        currencyCode: currency,
        customerId: userId ?? order.id,
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone!,
        returnUrl: `${siteUrl}/api/checkout/cashfree-return?order_id=${order.id}`,
        // Cashfree only accepts an HTTPS notify URL, so local dev goes without.
        notifyUrl: siteUrl.startsWith("https://") ? `${siteUrl}/api/webhooks/cashfree` : undefined,
      });
      providerOrderId = order.id;
      checkout = {
        provider: paymentProvider,
        paymentSessionId: cashfreeOrder.payment_session_id,
        cashfreeMode: getCashfreeMode(),
      };
    } else {
      const razorpayOrder = await createRazorpayOrder({
        amount: totalAmount,
        currencyCode: currency,
        receipt: order.id,
      });
      providerOrderId = razorpayOrder.id;
      checkout = {
        provider: paymentProvider,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      };
    }
  } catch (error) {
    console.error(`Could not create ${paymentProvider} order:`, error);
    // Local order already exists at this point — mark it FAILED rather
    // than leaving it dangling as PENDING with no Payment row.
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Could not create payment order." }, { status: 502 });
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: paymentProvider === "cashfree" ? "CASHFREE" : "RAZORPAY",
      providerOrderId,
      amount: totalAmount,
      currencyCode: currency,
      status: "CREATED",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: totalAmount,
    currencyCode: currency,
    ...checkout,
  });
}
