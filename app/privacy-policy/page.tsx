import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Little Ilmies collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updatedAt="July 2026">
      <p>
        Little Ilmies (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains
        what information we collect when you use our digital bookstore, and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Your name and email address, when you check out or sign in</li>
        <li>Order and purchase history, linked to your verified email</li>
        <li>Basic usage data (pages visited, device type) for improving the site</li>
        <li>Payment details are processed directly by Razorpay — we never store your card or UPI details</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To deliver your purchased e-books and manage your account</li>
        <li>To send order confirmations and, if you opt in, occasional newsletters</li>
        <li>To detect and prevent fraud or unauthorized access to purchased content</li>
      </ul>

      <h2>Email login</h2>
      <p>
        We use passwordless, email-based sign-in for buyer accounts. A secure link is sent to
        your email address; only you can access your account by clicking that link.
      </p>

      <h2>Data sharing</h2>
      <p>
        We do not sell your personal information. We share only what&apos;s necessary with our
        payment processor (Razorpay) to complete transactions, and with email delivery providers
        to send you order updates.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request a copy of your data, or ask us to delete your account and associated
        data, by contacting us at{" "}
        <a href="mailto:info@littleilmies.com">info@littleilmies.com</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach out via our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
