import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, RotateCcw, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Failed",
  robots: { index: false },
};

export default function PaymentFailedPage() {
  return (
    <div className="container-content pb-28 pt-8 xs:pt-10">
      <div className="mx-auto flex max-w-sm flex-col items-center rounded-3xl bg-cream-50 p-6 text-center shadow-clay-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-600 shadow-soft">
          <XCircle className="h-8 w-8" aria-hidden="true" />
        </span>

        <h1 className="mt-5 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
          Payment Failed
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Something went wrong while processing your payment. You haven&apos;t
          been charged — please try again, or reach out if the issue continues.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Link href="/checkout" className="btn-primary w-full">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry Payment
          </Link>
          <Link href="/cart" className="btn-secondary w-full">
            Return to Cart
          </Link>
          <Link
            href="/contact"
            className="tap-target mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-ink-400 hover:text-ink-600"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
