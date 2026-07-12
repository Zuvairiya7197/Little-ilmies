import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/store/legal-page-layout";

export const metadata: Metadata = {
  title: "Digital Delivery Policy",
  description: "How Little Ilmies delivers your purchased e-books instantly after checkout.",
  alternates: { canonical: "/digital-delivery-policy" },
};

export default function DigitalDeliveryPolicyPage() {
  return (
    <LegalPageLayout title="Digital Delivery Policy" updatedAt="July 2026">
      <p>
        All products on Little Ilmies are digital and delivered instantly — there is no
        physical shipping.
      </p>

      <h2>How delivery works</h2>
      <ul>
        <li>Once your payment is confirmed, your e-books are immediately available to download.</li>
        <li>You&apos;ll receive an order confirmation email with your receipt and a link to your account.</li>
        <li>
          Sign in anytime with the same email you checked out with to access your{" "}
          <a href="/account/downloads">Downloads</a> page.
        </li>
      </ul>

      <h2>No account needed to buy</h2>
      <p>
        You can complete checkout as a guest with just your name and email — an account isn&apos;t
        required to purchase. Your order is linked to your email, so you can always log in later
        with the same address to re-download your books.
      </p>

      <h2>File format</h2>
      <p>
        E-books are delivered as PDF files, viewable on any device and printable at home in
        Letter or A4 size.
      </p>

      <h2>Download access</h2>
      <p>
        You can re-download your purchased books at any time — there&apos;s no limit on the
        number of downloads, so long as you&apos;re signed in with the email used at checkout.
      </p>

      <h2>Trouble downloading?</h2>
      <p>
        If a download link isn&apos;t working, email us at{" "}
        <a href="mailto:info@littleilmies.com">info@littleilmies.com</a> with your order number
        and we&apos;ll help right away.
      </p>
    </LegalPageLayout>
  );
}
