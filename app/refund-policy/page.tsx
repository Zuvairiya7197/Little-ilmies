import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Little Ilmies' refund policy for digital e-book purchases.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" updatedAt="July 2026">
      <p>
        Because our products are instant digital downloads, we handle refunds a little
        differently from physical goods. Here&apos;s what to expect.
      </p>

      <h2>Before you download</h2>
      <p>
        If you purchased a book by mistake and haven&apos;t yet downloaded it, contact us within
        24 hours of purchase at{" "}
        <a href="mailto:info@littleilmies.com">info@littleilmies.com</a> with your order number,
        and we&apos;ll issue a full refund.
      </p>

      <h2>After you download</h2>
      <p>
        Once a file has been downloaded, we&apos;re unable to offer a refund, since the digital
        product has already been delivered and cannot be &quot;returned&quot;.
      </p>

      <h2>Faulty or corrupted files</h2>
      <p>
        If a file won&apos;t open, is missing pages, or otherwise doesn&apos;t match its
        description, let us know and we&apos;ll send a corrected file or offer a refund — no
        questions asked.
      </p>

      <h2>Duplicate charges</h2>
      <p>
        If you were accidentally charged twice for the same order, we&apos;ll refund the
        duplicate charge in full once verified.
      </p>

      <h2>How refunds are processed</h2>
      <p>
        Approved refunds are issued to your original payment method via Razorpay, typically
        within 5–7 business days.
      </p>

      <h2>Contact</h2>
      <p>
        For any refund request, reach out via our <a href="/contact">Contact page</a> or email{" "}
        <a href="mailto:info@littleilmies.com">info@littleilmies.com</a>.
      </p>
    </LegalPageLayout>
  );
}
