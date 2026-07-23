import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-blossom-50/20 to-ink-50/20 px-4 py-8 text-center">
      <section className="flex w-full max-w-3xl flex-col items-center">
        <div className="relative aspect-[4/3] w-full max-w-[min(36rem,82vw)]">
          <Image
            src="/images/404 page.png"
            alt="Sad open book illustration"
            fill
            sizes="(max-width: 768px) 82vw, 576px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="-mt-4 font-display text-[clamp(5rem,14vw,10rem)] font-bold leading-none text-ink-500">
          404
        </h1>
        <h2 className="mt-4 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
          This page could not be found.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-relaxed text-ink-400 xs:text-xl">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br className="hidden sm:block" />
          Let&apos;s get you back to something useful.
        </p>

        <div className="mt-10 flex flex-col items-center gap-5">
          <Link href="/" className="btn-primary rounded-2xl px-9 py-4 text-xl">
            <Home className="h-6 w-6" aria-hidden="true" />
            Go to Home
          </Link>
          <Link
            href="/"
            className="tap-target inline-flex items-center gap-2 text-lg font-semibold text-ink-400 hover:text-ink-600"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Go Back
          </Link>
        </div>
      </section>
    </main>
  );
}
