import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCashfreeSuccessfulPaymentId } from "@/lib/payments/cashfree";
import { fulfillOrder } from "@/lib/checkout/fulfill-order";
import { getSiteUrl } from "@/lib/site-url";

function redirectTo(path: string) {
  return NextResponse.redirect(new URL(path, getSiteUrl()), { status: 303 });
}

/**
 * Where Cashfree sends the buyer once their payment ends, whatever the
 * outcome. Anyone can open this URL, so payment is confirmed by asking
 * Cashfree, never from the query string. Like verify-payment, it converges
 * on fulfillOrder(), so it's safe alongside the webhook.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");
  if (!orderId) return redirectTo("/payment-failed");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { where: { provider: "CASHFREE" } }, items: true },
  });
  const payment = order?.payments[0];
  if (!order || !payment) return redirectTo("/payment-failed");

  let providerPaymentId: string | null;
  try {
    providerPaymentId = await getCashfreeSuccessfulPaymentId(payment.providerOrderId ?? order.id);
  } catch (error) {
    // The webhook still fulfills the order if the buyer did pay.
    console.error("Could not confirm Cashfree payment:", error);
    return redirectTo("/payment-failed");
  }
  if (!providerPaymentId) return redirectTo("/payment-failed");

  await fulfillOrder({ orderId: order.id, paymentId: payment.id, providerPaymentId });

  const isRentalOrder = order.items.some((item) => item.itemType === "RENTAL");
  return redirectTo(
    `/payment-success?email=${encodeURIComponent(order.buyerEmail)}&clearCart=1${isRentalOrder ? "&type=rental" : ""}`
  );
}
