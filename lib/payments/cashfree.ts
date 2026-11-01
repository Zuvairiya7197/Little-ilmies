import crypto from "node:crypto";

const API_VERSION = "2026-01-01";

export type CashfreeMode = "sandbox" | "production";

export function getCashfreeMode(): CashfreeMode {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

function getCashfreeConfig() {
  const { CASHFREE_APP_ID: appId, CASHFREE_SECRET_KEY: secretKey } = process.env;
  if (!appId || !secretKey) {
    throw new Error("Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env.");
  }
  return {
    appId,
    secretKey,
    baseUrl: getCashfreeMode() === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
  };
}

export function assertCashfreeConfigured() {
  getCashfreeConfig();
}

async function cashfreeRequest<T>(path: string, init?: { method: "POST"; body: unknown }): Promise<T> {
  const { appId, secretKey, baseUrl } = getCashfreeConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": appId,
      "x-client-secret": secretKey,
    },
    body: init ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Cashfree ${path} failed with ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Creates a Cashfree order for an amount/currency the backend has already
 * computed from ProductPrice (see app/api/checkout/create-order/route.ts).
 * Never pass a client-submitted amount here. Our Order.id doubles as the
 * Cashfree order_id, so the return route and webhook can find the order.
 */
export async function createCashfreeOrder({
  orderId,
  amount,
  currencyCode,
  customerId,
  buyerName,
  buyerEmail,
  buyerPhone,
  returnUrl,
  notifyUrl,
}: {
  orderId: string;
  amount: number; // minor units
  currencyCode: string;
  customerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  returnUrl: string;
  notifyUrl?: string;
}) {
  return cashfreeRequest<{ payment_session_id: string }>("/orders", {
    method: "POST",
    body: {
      order_id: orderId,
      order_amount: Number((amount / 100).toFixed(2)),
      order_currency: currencyCode,
      customer_details: {
        customer_id: customerId,
        customer_phone: buyerPhone,
        // Both are optional for Cashfree but length-limited, and our own
        // validation allows values it would reject.
        ...(buyerName.length >= 3 ? { customer_name: buyerName.slice(0, 100) } : {}),
        ...(buyerEmail.length <= 100 ? { customer_email: buyerEmail } : {}),
      },
      order_meta: {
        return_url: returnUrl,
        ...(notifyUrl ? { notify_url: notifyUrl } : {}),
      },
    },
  });
}

/**
 * Asks Cashfree directly whether an order was paid, and returns the id of
 * the successful payment. The buyer's redirect back to us proves nothing on
 * its own, so this server-side check is what confirms the payment.
 */
export async function getCashfreeSuccessfulPaymentId(orderId: string): Promise<string | null> {
  const path = `/orders/${encodeURIComponent(orderId)}`;
  const order = await cashfreeRequest<{ order_status: string }>(path);
  if (order.order_status !== "PAID") return null;

  const payments = await cashfreeRequest<{ cf_payment_id: string | number; payment_status: string }[]>(
    `${path}/payments`
  );
  const payment = payments.find((p) => p.payment_status === "SUCCESS");
  return payment ? String(payment.cf_payment_id) : null;
}

/**
 * Verifies the signature on Cashfree webhooks: a Base64 HMAC-SHA256 of the
 * timestamp header followed by the raw body, keyed with our secret key.
 */
export function verifyCashfreeWebhookSignature({
  body,
  signature,
  timestamp,
}: {
  body: string;
  signature: string;
  timestamp: string;
}): boolean {
  const { secretKey } = getCashfreeConfig();
  const expected = Buffer.from(crypto.createHmac("sha256", secretKey).update(timestamp + body).digest("base64"));
  const received = Buffer.from(signature);

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
