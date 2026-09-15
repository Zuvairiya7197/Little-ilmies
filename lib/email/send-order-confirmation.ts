import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils/format";
import { sendMail } from "@/lib/email/send-mail";
import type { CurrencyCode } from "@/types/pricing";
import { parseCustomBundleSnapshot } from "@/lib/bundles/order-snapshot";
import { RENTAL_DURATION_DAYS } from "@/lib/rentals/config";

export async function sendOrderConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, rentals: { include: { product: true } } },
  });
  if (!order) return;

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const currency = order.currencyCode as CurrencyCode;
  // Rentals always check out separately from purchases (see
  // create-order/route.ts), so an order is either entirely rentals or
  // entirely purchases — never mixed.
  const isRentalOrder = order.items.some((item) => item.itemType === "RENTAL");

  const displayItems = order.items.flatMap((item) => {
    if (item.itemType === "CUSTOM_BUNDLE") {
      const snapshot = parseCustomBundleSnapshot(item.bundleSnapshot);
      if (!snapshot) return [];
      return [{
        title: `${snapshot.bundleName} (${snapshot.quantity} books)`,
        detail: snapshot.selectedBooks.map((book) => book.title).join(", "),
        unitPrice: item.unitPrice,
      }];
    }
    if (!item.product) return [];
    return [{ title: item.product.title, detail: "", unitPrice: item.unitPrice }];
  });

  const itemLines = displayItems
    .map((item) => `- ${item.title}${item.detail ? `: ${item.detail}` : ""} — ${formatPrice(item.unitPrice, currency)}`)
    .join("\n");

  const itemRows = displayItems
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.title}${item.detail ? `<br><span style="color:#777;font-size:12px;">${item.detail}</span>` : ""}</td><td style="padding:8px 0;text-align:right;">${formatPrice(item.unitPrice, currency)}</td></tr>`
    )
    .join("");

  if (isRentalOrder) {
    const rental = order.rentals[0];
    const expiresAtLabel = rental
      ? rental.rentalExpiresAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : null;
    const readNowUrl = rental ? `${siteUrl}/read/${rental.productId}` : `${siteUrl}/account/rentals`;

    await sendMail({
      to: order.buyerEmail,
      subject: "Your Rent & Read access is ready",
      text: `Your Rent & Read access is ready, ${order.buyerName}!\n\nOrder #${order.id.slice(-8).toUpperCase()}\n\n${itemLines}\n\nTotal: ${formatPrice(order.totalAmount, currency)}\n\nAccess: ${RENTAL_DURATION_DAYS} days${expiresAtLabel ? `\nExpires: ${expiresAtLabel}` : ""}\n\nRead now: ${readNowUrl}\n\nThis rental provides online reading access only — no download or attachment is included, and access ends automatically when the rental expires.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h1 style="font-size:20px;">Your Rent & Read access is ready, ${order.buyerName}!</h1>
          <p style="color:#666;">Order #${order.id.slice(-8).toUpperCase()}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${itemRows}
            <tr><td style="padding:12px 0 0;font-weight:bold;border-top:1px solid #eee;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:bold;border-top:1px solid #eee;">${formatPrice(order.totalAmount, currency)}</td></tr>
          </table>
          <p>Access: ${RENTAL_DURATION_DAYS} days${expiresAtLabel ? `<br>Expires: ${expiresAtLabel}` : ""}</p>
          <p><a href="${readNowUrl}" style="display:inline-block;background:#4B449D;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">Read Now</a></p>
          <p style="color:#777;font-size:12px;">This rental provides online reading access only. There is no download or attachment, and access ends automatically when the rental expires.</p>
        </div>
      `,
    });
    return;
  }

  await sendMail({
    to: order.buyerEmail,
    subject: "Your Little Ilmies order is confirmed",
    text: `Thank you for your order, ${order.buyerName}!\n\nOrder #${order.id.slice(-8).toUpperCase()}\n\n${itemLines}\n\nTotal: ${formatPrice(order.totalAmount, currency)}\n\nYour e-books are ready. Log in at ${siteUrl}/login with ${order.buyerEmail} to access your downloads anytime.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h1 style="font-size:20px;">Thank you for your order, ${order.buyerName}!</h1>
        <p style="color:#666;">Order #${order.id.slice(-8).toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          ${itemRows}
          <tr><td style="padding:12px 0 0;font-weight:bold;border-top:1px solid #eee;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:bold;border-top:1px solid #eee;">${formatPrice(order.totalAmount, currency)}</td></tr>
        </table>
        <p>Your e-books are ready. Log in with <strong>${order.buyerEmail}</strong> anytime to access your downloads.</p>
        <p><a href="${siteUrl}/login" style="display:inline-block;background:#4B449D;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">Log in to Little Ilmies</a></p>
      </div>
    `,
  });
}
