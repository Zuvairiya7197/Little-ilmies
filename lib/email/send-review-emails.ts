import { sendMail } from "@/lib/email/send-mail";
import { getSiteUrl } from "@/lib/site-url";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendReviewRewardEmail({
  to,
  bookTitle,
  code,
  percentage,
  expiresAt,
  isFirstReview,
  minimumOrder,
}: {
  /** e.g. "₹500 in India, or $15 / £12 / AED 55 elsewhere" */
  minimumOrder: string;
  to: string;
  bookTitle: string;
  code: string;
  percentage: number;
  expiresAt: Date | null;
  isFirstReview: boolean;
}) {
  const siteUrl = getSiteUrl("http://localhost:3000");
  const expiresLabel = expiresAt?.toLocaleDateString("en-IN", { dateStyle: "medium" });
  const headline = isFirstReview
    ? `You're the first to review ${bookTitle}!`
    : `Thank you for reviewing ${bookTitle}!`;

  await sendMail({
    to,
    subject: `Your ${percentage}% off reward from Little Ilmies`,
    text: `${headline}\n\nJazakAllahu khairan! Your review is now live and helps other parents choose.\n\nHere is ${percentage}% off your next order:\n\n${code}\n\nUse it once at checkout with this email address (${to}).\nMinimum order: ${minimumOrder}.${expiresLabel ? `\nValid until ${expiresLabel}.` : ""}\n\nShop: ${siteUrl}/shop`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h1 style="font-size:20px;">${escapeHtml(headline)}</h1>
        <p>JazakAllahu khairan! Your review is now live and helps other parents choose.</p>
        <p>Here is <strong>${percentage}% off</strong> your next order:</p>
        <p style="font-family:monospace;font-size:22px;font-weight:bold;letter-spacing:2px;background:#f5f1e8;padding:14px;border-radius:12px;text-align:center;">${code}</p>
        <p style="color:#666;font-size:13px;">Use it once at checkout with this email address (${escapeHtml(to)}).<br/>Minimum order: ${escapeHtml(minimumOrder)}.${expiresLabel ? `<br/>Valid until ${expiresLabel}.` : ""}</p>
        <p><a href="${siteUrl}/shop" style="display:inline-block;background:#4B449D;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">Choose your next book</a></p>
      </div>
    `,
  });
}

/** Lets the shop know a review is waiting for approval. */
export async function sendNewReviewNotification({
  bookTitle,
  authorName,
  rating,
  body,
}: {
  bookTitle: string;
  authorName: string;
  rating: number;
  body: string;
}) {
  const siteUrl = getSiteUrl("http://localhost:3000");
  await sendMail({
    to: process.env.EMAIL_FROM ?? "contact@littleilmies.com",
    subject: `New ${rating}★ review to approve: ${bookTitle}`,
    // Also listed in Admin → Reviews.
    priority: "optional",
    text: `${authorName} reviewed ${bookTitle} (${rating}/5):\n\n${body}\n\nApprove or reject: ${siteUrl}/admin/reviews`,
    html: `<p><strong>${escapeHtml(authorName)}</strong> reviewed <strong>${escapeHtml(bookTitle)}</strong> (${rating}/5):</p><p>${escapeHtml(body).replace(/\n/g, "<br/>")}</p><p><a href="${siteUrl}/admin/reviews">Approve or reject</a></p>`,
  });
}

/** A coupon was paid for beyond its limits (two checkouts open at once).
 * The order is fulfilled — the money is taken — but the shop should know. */
export async function sendCouponOveruseAlert({
  reason,
  code,
  orderId,
  buyerEmail,
  discount,
  currencyCode,
}: {
  /** e.g. "the same customer had already used it" */
  reason: string;
  code: string;
  orderId: string;
  buyerEmail: string;
  discount: number;
  currencyCode: string;
}) {
  const siteUrl = getSiteUrl("http://localhost:3000");
  const amount = formatPrice(discount, currencyCode as CurrencyCode);
  const orderRef = `#${orderId.slice(-8).toUpperCase()}`;
  await sendMail({
    to: process.env.EMAIL_FROM ?? "contact@littleilmies.com",
    subject: `Coupon ${code} was used more times than allowed`,
    text: `Order ${orderRef} (${buyerEmail}) was paid with coupon ${code}, but ${reason}. The buyer got ${amount} off that they weren't entitled to.\n\nOrder: ${siteUrl}/admin/orders/${orderId}`,
    html: `<p>Order <strong>${orderRef}</strong> (${escapeHtml(buyerEmail)}) was paid with coupon <strong>${escapeHtml(code)}</strong>, but ${escapeHtml(reason)}. The buyer got <strong>${amount}</strong> off that they weren't entitled to.</p><p><a href="${siteUrl}/admin/orders/${orderId}">View order</a></p>`,
  });
}
