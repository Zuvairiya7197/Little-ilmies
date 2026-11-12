import { prisma } from "@/lib/db/prisma";
import { sendMail } from "@/lib/email/send-mail";
import { getSiteUrl } from "@/lib/site-url";
import { formatPrice } from "@/lib/utils/format";
import {
  bankTransferDeadline,
  bankTransferReference,
  bankTransferWhatsAppUrl,
  getBankTransferInfo,
} from "@/lib/payments/bank-transfer";
import type { CurrencyCode } from "@/types/pricing";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Sent when a bank transfer order is placed: payment instructions to the
 * buyer (so they can pay later from their banking app), and a heads-up to
 * the shop to watch for the money. */
export async function sendBankTransferOrderEmails(orderId: string) {
  const bankTransfer = getBankTransferInfo();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !bankTransfer) return;

  const siteUrl = getSiteUrl("http://localhost:3000");
  const reference = bankTransferReference(order.id);
  const amount = formatPrice(order.totalAmount, order.currencyCode as CurrencyCode);
  const pageUrl = `${siteUrl}/bank-transfer/${order.id}`;
  const whatsappUrl = bankTransferWhatsAppUrl(bankTransfer.whatsappNumber, {
    reference,
    amount,
    buyerName: order.buyerName,
  });
  const deadline = bankTransferDeadline(order.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" });
  const discountLine =
    order.discountAmount > 0
      ? `Your coupon discount of ${formatPrice(order.discountAmount, order.currencyCode as CurrencyCode)} is included.`
      : "";

  await sendMail({
    to: order.buyerEmail,
    subject: `Complete your Little Ilmies order: transfer ${amount}`,
    text: `Assalamu alaikum ${order.buyerName},\n\nYour order is reserved until ${deadline}. To complete it, transfer exactly ${amount} to:\n\n${bankTransfer.details}\n\nWrite this reference in the transfer note: ${reference}\n${discountLine ? `\n${discountLine}\n` : ""}\nThen send us the payment proof on WhatsApp: ${whatsappUrl}\n\nAs soon as we confirm it, your books appear in your account and we email you. Order details: ${pageUrl}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h1 style="font-size:20px;">Your order is reserved, ${escapeHtml(order.buyerName)}</h1>
        <p>Your order is reserved until <strong>${deadline}</strong>. To complete it, transfer exactly <strong>${amount}</strong> to:</p>
        <pre style="font-family:inherit;white-space:pre-wrap;background:#f5f1e8;padding:14px;border-radius:12px;">${escapeHtml(bankTransfer.details)}</pre>
        <p>Write this reference in the transfer note:</p>
        <p style="font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:2px;background:#f5f1e8;padding:12px;border-radius:12px;text-align:center;">${reference}</p>
        ${discountLine ? `<p style="color:#2f7a4f;">${discountLine}</p>` : ""}
        <p><a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#06291B;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">Send payment proof on WhatsApp</a></p>
        <p style="color:#666;font-size:13px;">As soon as we confirm your payment, your books appear in your account and we email you. <a href="${pageUrl}">View your order</a></p>
      </div>
    `,
  });

  await sendMail({
    to: process.env.EMAIL_FROM ?? "contact@littleilmies.com",
    subject: `Bank transfer order ${reference}: expect ${amount}`,
    // Also on the admin dashboard and in Orders.
    priority: "optional",
    text: `${order.buyerName} <${order.buyerEmail}> placed a bank transfer order.\n\nReference: ${reference}\nAmount: ${amount}\n\nWhen the money arrives, open the order and click "Mark bank transfer received": ${siteUrl}/admin/orders/${order.id}`,
    html: `<p><strong>${escapeHtml(order.buyerName)}</strong> &lt;${escapeHtml(order.buyerEmail)}&gt; placed a bank transfer order.</p><p>Reference: <strong>${reference}</strong><br/>Amount: <strong>${amount}</strong></p><p>When the money arrives, open the order and click "Mark bank transfer received": <a href="${siteUrl}/admin/orders/${order.id}">view order</a></p>`,
  });
}
