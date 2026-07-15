const hasResendConfig = Boolean(process.env.RESEND_API_KEY);

/**
 * Shared transactional email sender, via Resend's HTTP API. Not SMTP —
 * Vercel (and most serverless hosts) block or restrict outbound SMTP, which
 * made Gmail SMTP silently fail to send in production even with valid
 * credentials. In local dev without RESEND_API_KEY configured, logs to the
 * terminal instead of sending (same fallback used by Auth.js's magic-link
 * provider — see lib/auth/config.ts) so the full purchase flow is testable
 * without a real mail provider.
 */
export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
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
    from: process.env.EMAIL_FROM ?? "Little Ilmies <hello@littleilmies.com>",
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
}
