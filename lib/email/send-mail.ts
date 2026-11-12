import { prisma } from "@/lib/db/prisma";

const hasResendConfig = Boolean(process.env.RESEND_API_KEY);

/** The email provider's daily sending limit (Resend's free plan: 100). */
export const EMAIL_DAILY_LIMIT = Number(process.env.EMAIL_DAILY_LIMIT) || 100;
/** Optional emails stop at this share of the limit, keeping the rest free
 * for sign-in links — the one flow customers can't get past without email. */
const OPTIONAL_EMAIL_SHARE = 0.7;

/**
 * "essential": the customer or shop needs it to complete something (sign-in
 * link, order confirmation, payment instructions, reward code, a contact
 * message). Always sent. "optional": nice to have, and also visible in the
 * admin (new-review and new-bank-transfer notices, contact acknowledgement).
 * Skipped once today's sends reach OPTIONAL_EMAIL_SHARE of the limit.
 */
export type EmailPriority = "essential" | "optional";

const today = () => new Date().toISOString().slice(0, 10);

export async function getEmailsSentToday() {
  const row = await prisma.emailDailyCount.findUnique({ where: { day: today() } });
  return row?.count ?? 0;
}

/**
 * Shared transactional email sender, via Resend's HTTP API. Not SMTP —
 * Vercel (and most serverless hosts) block or restrict outbound SMTP, which
 * made Gmail SMTP silently fail to send in production even with valid
 * credentials. In local dev without RESEND_API_KEY configured, logs to the
 * terminal instead of sending (same fallback used by Auth.js's magic-link
 * provider — sign-in links come through here too) so the full purchase flow
 * is testable without a real mail provider.
 */
export async function sendMail({
  to,
  subject,
  text,
  html,
  priority = "essential",
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
  priority?: EmailPriority;
}) {
  // If the counter can't be read, send anyway: a lost notice is worse than
  // one email over budget.
  const sentToday = priority === "optional" ? await getEmailsSentToday().catch(() => 0) : 0;
  if (priority === "optional" && sentToday >= EMAIL_DAILY_LIMIT * OPTIONAL_EMAIL_SHARE) {
    console.warn(`Optional email skipped to save today's email quota: ${subject}`);
    return;
  }

  if (!hasResendConfig) {
    console.log("\n=================================================");
    console.log(`Email to ${to}: ${subject}`);
    console.log(text);
    console.log("=================================================\n");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    to,
    from: process.env.EMAIL_FROM ?? "Little Ilmies <contact@littleilmies.com>",
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }

  // Counting must never fail a send that already went out.
  await prisma.emailDailyCount
    .upsert({ where: { day: today() }, update: { count: { increment: 1 } }, create: { day: today(), count: 1 } })
    .catch((err) => console.error("Failed to count sent email:", err));
}
