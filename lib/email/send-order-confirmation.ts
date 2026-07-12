import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils/format";
import { sendMail } from "@/lib/email/send-mail";
import type { CurrencyCode } from "@/types/pricing";

export async function sendOrderConfirmationEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return;

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const currency = order.currencyCode as CurrencyCode;

  const itemLines = order.items
    .map((item) => `- ${item.product.title} — ${formatPrice(item.unitPrice, currency)}`)
    .join("\n");

  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.product.title}</td><td style="padding:8px 0;text-align:right;">${formatPrice(item.unitPrice, currency)}</td></tr>`
    )
    .join("");

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
