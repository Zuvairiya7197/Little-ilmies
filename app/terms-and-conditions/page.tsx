import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of the Little Ilmies website and purchase of our digital e-books.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" updatedAt="November 2026">
      <p>
        By using littleilmies.com and purchasing our e-books, you agree to the terms below.
      </p>

      <h2>Digital products</h2>
      <p>
        All products sold by Little Ilmies are digital — e-books delivered as downloadable PDF
        files (or online reading, for Rent &amp; Read). No physical items are shipped. How you may use
        each book depends on the licence shown on its page (personal, personal and classroom, or
        commercial use).
      </p>

      <h2>Licence to use</h2>
      <ul>
        <li>
          You may download and print purchased e-books for the uses their licence allows — your own family and
          homeschool, plus classroom or madrasa use where the book&apos;s licence includes it.
        </li>
        <li>You may not resell, redistribute, or publicly share the PDF files.</li>
        <li>Removing or altering any Little Ilmies branding from the files is not permitted.</li>
      </ul>

      <h2>Accounts</h2>
      <p>
        You can check out as a guest, or sign in with a magic link sent to your email — we never
        ask buyers for a password. Paying by bank transfer, writing reviews and downloading your
        books require signing in. Keep access to your email address secure, as it&apos;s how
        you&apos;ll access your purchase history and downloads.
      </p>

      <h2>Payments</h2>
      <p>
        Payments are processed securely via Razorpay or Cashfree. We never see or store your full card, UPI,
        or bank details. All charges are made in the currency shown to you at checkout.
      </p>
      <p>
        International customers may instead pay by bank transfer. A bank transfer order holds its price and any
        coupon for 7 days; your books are delivered once we&apos;ve confirmed the money has reached our account.
        Refunds are covered by our <a href="/refund-policy">Refund Policy</a>.
      </p>

      <h2>Coupons and review rewards</h2>
      <ul>
        <li>Each coupon can be used once per customer, and only one coupon applies to an order.</li>
        <li>
          Coupons apply only to orders of at least a minimum amount (shown at checkout, e.g. ₹500 in India), on
          online payments or confirmed bank transfer orders.
        </li>
        <li>Coupons have no cash value, can&apos;t be exchanged or transferred, and expire on the date shown.</li>
        <li>
          Review reward codes are sent for approved reviews of books you bought — one code per order — and work
          only with the email address of the account that wrote the review.
        </li>
        <li>
          Rewards are given for honest reviews, positive or negative. We may decline reviews that are spam,
          abusive, contain personal details or aren&apos;t about the book, and we may cancel coupons or rewards
          obtained through misuse (for example, duplicate accounts).
        </li>
        <li>
          We may change or end coupon and reward offers at any time. Codes already issued stay valid until they
          expire, unless cancelled under these terms or our Refund Policy.
        </li>
      </ul>

      <h2>Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of India. Subject to your rights under consumer protection law
        (including to approach a consumer commission), the courts at {BUSINESS.jurisdiction} have jurisdiction over
        any dispute. Please contact our Grievance Officer first — details are on our{" "}
        <a href="/contact">Contact page</a> — so we can try to resolve it quickly.
      </p>

      <h2>Who we are</h2>
      <p>
        {BUSINESS.tradingName} is operated by {BUSINESS.ownerName}, {BUSINESS.address}. Email{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or call {BUSINESS.phone}.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after changes
        means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach out via our <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
