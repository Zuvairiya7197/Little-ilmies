const hasSmtpConfig = Boolean(process.env.EMAIL_SERVER_HOST);

/**
 * Shared transactional email sender. In local dev without SMTP configured,
 * logs to the terminal instead of sending (same fallback used by Auth.js's
 * magic-link provider — see lib/auth/config.ts) so the full purchase flow
 * is testable without a real mail provider.
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
  if (!hasSmtpConfig) {
    console.log("\n=================================================");
    console.log(`Email to ${to}: ${subject}`);
    console.log(text);
    console.log("=================================================\n");
    return;
  }

  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transport.sendMail({
    to,
    from: process.env.EMAIL_FROM ?? "Little Ilmies <hello@littleilmies.com>",
    subject,
    text,
    html,
  });
}
