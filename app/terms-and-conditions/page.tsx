import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of the Little Ilmies website and purchase of our digital e-books.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" updatedAt="July 2026">
      <p>
        By using littleilmies.com and purchasing our e-books, you agree to the terms below.
      </p>

      <h2>Digital products</h2>
      <p>
        All products sold by Little Ilmies are digital — e-books delivered as downloadable PDF
        files. No physical items are shipped. Purchases are for personal, household, or
        classroom/madrasa use.
      </p>

      <h2>Licence to use</h2>
      <ul>
        <li>You may download and print purchased e-books for your own family, classroom, or homeschool use.</li>
        <li>You may not resell, redistribute, or publicly share the PDF files.</li>
        <li>Removing or altering any Little Ilmies branding from the files is not permitted.</li>
      </ul>

      <h2>Accounts</h2>
      <p>
        You can check out as a guest, or sign in with a magic link sent to your email — we never
        ask buyers for a password. Keep access to your email address secure, as it&apos;s how
        you&apos;ll access your purchase history and downloads.
      </p>

      <h2>Payments</h2>
      <p>
        Payments are processed securely via Razorpay. We never see or store your full card, UPI,
        or bank details. All charges are made in the currency shown to you at checkout.
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
