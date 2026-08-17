import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-6rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-blossom-50/20 to-ink-50/20 px-4 py-4 text-center sm:py-6">
      <section className="flex w-full max-w-3xl flex-col items-center">
        <div className="relative aspect-[3/2] w-full max-w-[min(30rem,86vw)] max-h-[34svh]">
          <Image
            src="/images/404 page.png"
            alt="Sad open book illustration"
            fill
            sizes="(max-width: 768px) 86vw, 480px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="-mt-2 font-display text-[clamp(3.5rem,10vw,7rem)] font-bold leading-none text-ink-500">
          404
        </h1>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-ink-700 xs:text-3xl">
          This page could not be found.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-ink-400 xs:text-base sm:text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br className="hidden sm:block" />
          Let&apos;s get you back to something useful.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:mt-7">
          <Link href="/" className="btn-primary rounded-2xl px-7 py-3 text-base sm:px-8 sm:py-3.5 sm:text-lg">
            <Home className="h-5 w-5" aria-hidden="true" />
            Go to Home
          </Link>
          <Link
            href="/"
            className="tap-target inline-flex items-center gap-2 text-sm font-semibold text-ink-400 hover:text-ink-600 sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go Back
          </Link>
        </div>
      </section>
    </main>
  );
}
