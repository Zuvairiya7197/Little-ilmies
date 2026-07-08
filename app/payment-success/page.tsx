import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Successful",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <div className="container-content flex flex-col items-center py-12 text-center xs:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-600">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mt-5 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Payment Successful
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-ink-500">
        Your e-books are ready. You can access them anytime by logging in with
        the same email{email ? ` (${email})` : ""}.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link href="/account/downloads" className="btn-primary w-full">
          <Download className="h-4 w-4" aria-hidden="true" />
          Go to Downloads
        </Link>
        <Link href="/login" className="btn-secondary w-full">
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Login / Create Account
        </Link>
      </div>
    </div>
  );
}
