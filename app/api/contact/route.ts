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
    to: process.env.EMAIL_FROM ?? "hello@littleilmies.com",
    subject: subject ? `Contact form: ${subject}` : `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
  });

  return NextResponse.json({ status: "ok" });
}
