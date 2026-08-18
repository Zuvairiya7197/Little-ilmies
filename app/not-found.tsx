import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-7rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-blossom-50/20 to-ink-50/20 px-4 py-2 text-center sm:py-3">
      <section className="flex w-full max-w-3xl flex-col items-center justify-center">
        <div className="relative h-[clamp(9rem,26svh,17rem)] w-full max-w-[min(26rem,86vw)]">
          <Image
            src="/images/404 page.png"
            alt="Sad open book illustration"
            fill
            sizes="(max-width: 768px) 86vw, 416px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="-mt-1 font-display text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-none text-ink-500">
          404
        </h1>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight text-ink-700 xs:text-2xl sm:text-3xl">
          This page could not be found.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-snug text-ink-400 sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br className="hidden sm:block" />
          Let&apos;s get you back to something useful.
        </p>

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5">
          <Link href="/" className="btn-primary rounded-2xl px-6 py-2.5 text-sm sm:px-7 sm:py-3 sm:text-base">
            <Home className="h-4 w-4" aria-hidden="true" />
            Go to Home
          </Link>
          <Link
            href="/"
            className="tap-target inline-flex items-center gap-2 text-xs font-semibold text-ink-400 hover:text-ink-600 sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Go Back
          </Link>
        </div>
      </section>
    </main>
  );
}
