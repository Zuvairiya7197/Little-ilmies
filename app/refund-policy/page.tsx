import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Little Ilmies' refund policy for digital e-book purchases.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" updatedAt="November 2026">
      <p>
        Our books are digital and are delivered to your account the moment your payment is confirmed. Because a
        delivered digital file can&apos;t be returned, <strong>purchases are not refundable</strong> — including
        if you change your mind, bought the wrong book, or haven&apos;t downloaded it yet. Instead, we make sure you
        always get the book you paid for. We refund only in the three cases below.
      </p>

      <h2>When we refund</h2>

      <h3>1. You were charged twice</h3>
      <p>
        If the same order was paid more than once by mistake, we refund every extra payment in full once
        we&apos;ve checked it with our payment provider or bank.
      </p>

      <h3>2. A faulty file we can&apos;t fix</h3>
      <p>
        If a file won&apos;t open, has missing pages, or doesn&apos;t match its description, tell us within 30 days
        of purchase. We&apos;ll first send you a corrected file. If we can&apos;t fix the problem within 14 days
        of your report, we refund that book (for a book bought in a bundle, its share of the bundle price).
      </p>

      <h3>3. We can&apos;t give you the book</h3>
      <p>
        If your payment went through but you can&apos;t access your book, contact us and we&apos;ll deliver it
        (usually by fixing your account access or sending the file directly). If we&apos;re unable to deliver it
        at all — for example, because the book has been withdrawn — we refund it in full.
      </p>

      <h2>What we don&apos;t refund</h2>
      <ul>
        <li>Change of mind, or buying a book by mistake.</li>
        <li>Books that are delivered and work as described, whether or not you&apos;ve downloaded them.</li>
        <li>
          Rent &amp; Read rentals once reading access has started (if the reader doesn&apos;t work, case 2 above
          applies).
        </li>
        <li>
          Coupon codes used on a refunded order aren&apos;t returned — except when the refund is under case 2 or 3,
          where we&apos;ll send you a replacement code on request.
        </li>
      </ul>

      <h2>How refunds are paid</h2>
      <p>
        Online payments are refunded to your original payment method through our payment provider, usually within
        7–10 business days after we approve the refund (your bank may take longer to show it). Bank transfer payments are refunded by bank transfer to the
        account you paid from; any charges your bank or an intermediary bank deducts are outside our control.
      </p>
      <p>
        When a book is refunded, access to it (downloads or reading) ends, and any review reward earned from that
        book is cancelled if it hasn&apos;t been used.
      </p>

      <h2>How to ask</h2>
      <p>
        Email <a href="mailto:contact@littleilmies.com">contact@littleilmies.com</a> or use our{" "}
        <a href="/contact">Contact page</a> with your order number and a short description of the problem (a
        screenshot helps for faulty files). We acknowledge every request within 48 hours and resolve it within one
        month at the latest — usually much sooner. Please contact us before disputing a payment with your bank, so
        we can sort it out quickly. If you&apos;re not satisfied with our answer, you can escalate it to our Grievance
        Officer, whose details are on our <a href="/contact">Contact page</a>.
      </p>
      <p>This policy doesn&apos;t affect any rights you have under the consumer law that applies to you.</p>
    </LegalPageLayout>
  );
}
