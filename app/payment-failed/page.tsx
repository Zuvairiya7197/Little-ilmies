import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, RotateCcw, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Failed",
  robots: { index: false },
};

export default function PaymentFailedPage() {
  return (
    <div className="container-content flex flex-col items-center py-12 text-center xs:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-600">
        <XCircle className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mt-5 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Payment Failed
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-ink-500">
        Something went wrong while processing your payment. You haven&apos;t
        been charged — please try again, or reach out if the issue continues.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
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
  );
}
