import { NextResponse, type NextRequest } from "next/server";
import { contactFormSchema } from "@/lib/validation/contact";
import { sendMail } from "@/lib/email/send-mail";

export async function POST(request: NextRequest) {
  const parsed = contactFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  await sendMail({
    to: process.env.EMAIL_FROM ?? "contact@littleilmies.com",
    subject: subject ? `Contact form: ${subject}` : `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
  });

  // Acknowledges receipt, as the E-Commerce Rules require within 48 hours.
  // Fixed text only — nothing the sender typed — so the form can't be used to
  // send our emails with someone else's content to a stranger.
  await sendMail({
    to: email,
    subject: "We've received your message — Little Ilmies",
    priority: "optional",
    text: "Assalamu alaikum,\n\nThank you for contacting Little Ilmies. We've received your message and will reply as soon as we can — always within one month, and usually much sooner.\n\nFor a refund or order problem, please include your order number if you haven't already.\n\nIf you didn't contact us, you can ignore this email.\n\nLittle Ilmies",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;"><p>Assalamu alaikum,</p><p>Thank you for contacting Little Ilmies. We've received your message and will reply as soon as we can — always within one month, and usually much sooner.</p><p>For a refund or order problem, please include your order number if you haven't already.</p><p style="color:#777;font-size:12px;">If you didn't contact us, you can ignore this email.</p></div>`,
  }).catch((err) => {
    // The shop already has the message; a failed acknowledgement isn't fatal.
    console.error("Failed to send contact acknowledgement:", err);
  });

  return NextResponse.json({ status: "ok" });
}
