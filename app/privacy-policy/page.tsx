import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Little Ilmies collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updatedAt="November 2026">
      <p>
        Little Ilmies (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains
        what information we collect when you use our digital bookstore, and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Your name and email address, when you check out or sign in</li>
        <li>Your mobile number, when our payment provider needs it to process your payment</li>
        <li>Order and purchase history, linked to your verified email</li>
        <li>Reviews you write, with the display name you choose</li>
        <li>
          If you pay by bank transfer: the sender name and account details that appear on the transfer, and the
          payment proof you send us on WhatsApp (along with your WhatsApp number)
        </li>
        <li>Basic usage data (pages visited, device type) for improving the site</li>
        <li>Payment details are processed directly by our payment provider (Razorpay or Cashfree) — we never store your card or UPI details</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To deliver your purchased e-books and manage your account</li>
        <li>To send order confirmations and account-related emails</li>
        <li>To detect and prevent fraud or unauthorized access to purchased content</li>
        <li>To confirm bank transfer payments and issue refunds</li>
        <li>To publish your approved reviews and send you any review reward code</li>
        <li>To measure how well our Facebook and Instagram adverts work (see Cookies below)</li>
      </ul>

      <h2>Reviews</h2>
      <p>
        Approved reviews are public on the book&apos;s page, shown with the display name you chose — never your
        email address. Reviews marked &quot;Gifted copy&quot; were sent to us by parents who received a free book,
        and are published with their permission. You can ask us to remove your review at any time.
      </p>

      <h2>Cookies and similar technologies</h2>
      <ul>
        <li>
          <strong>Essential:</strong> a sign-in cookie that keeps you logged in, and a cookie remembering your
          country so we show prices in the right currency. Your cart and similar preferences are saved in your
          browser.
        </li>
        <li>
          <strong>Advertising measurement (only with your permission):</strong> if you click &quot;Accept&quot; on
          our cookie banner, we use the Meta Pixel, which tells Meta Platforms (Facebook and Instagram) which of our
          pages you view, along with technical details such as your browser and IP address. We use this to measure
          our adverts, and Meta handles this data under its own privacy policy. If you decline, it never loads. You
          can change your choice at any time with &quot;Cookie settings&quot; at the bottom of every page.
        </li>
      </ul>

      <h2>Email login</h2>
      <p>
        We use passwordless, email-based sign-in for buyer accounts. A secure link is sent to
        your email address; only you can access your account by clicking that link.
      </p>

      <h2>Data sharing</h2>
      <p>
        We do not sell your personal information. We share only what&apos;s necessary with our
        payment processor (Razorpay or Cashfree) to complete transactions, with email delivery providers to send
        you order updates, with Meta for advert measurement (see Cookies above), and with banks when we confirm
        or refund a bank transfer.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request a copy of your data, or ask us to delete your account and associated
        data, by contacting us at{" "}
        <a href="mailto:contact@littleilmies.com">contact@littleilmies.com</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach out via our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
