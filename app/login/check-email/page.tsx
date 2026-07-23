import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Check Your Email",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function CheckEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <div className="relative isolate flex min-h-[calc(100vh-9rem)] items-start justify-center overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 px-4 py-3 xl:py-4">
      <Image
        src="/images/star.png"
        alt=""
        width={44}
        height={44}
        className="pointer-events-none absolute left-[17%] top-[34%] h-9 w-9 rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={44}
        height={44}
        className="pointer-events-none absolute right-[18%] top-[28%] h-10 w-10 -rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={32}
        height={32}
        className="pointer-events-none absolute bottom-[22%] right-[20%] h-7 w-7 rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/heart.png"
        alt=""
        width={70}
        height={70}
        className="pointer-events-none absolute bottom-[22%] left-[16%] h-16 w-16 -rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute left-[38%] top-[39%] h-4 w-4 rounded-full bg-blossom-400/70" aria-hidden="true" />
      <span className="pointer-events-none absolute right-[18%] top-[56%] h-4 w-4 rounded-full bg-blossom-400/70" aria-hidden="true" />
      <span className="pointer-events-none absolute left-[12%] top-[55%] h-4 w-4 rounded-full bg-ink-200" aria-hidden="true" />

      <main className="w-full max-w-md rounded-[1.75rem] bg-cream-50/95 px-6 py-4 text-center shadow-lifted sm:px-8 xl:px-10 xl:py-5">
        <div className="relative mx-auto aspect-[4/3] max-w-[13.5rem] xl:max-w-[15rem]">
          <Image
            src="/images/check your email.png"
            alt="Envelope with a verified email"
            fill
            sizes="384px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="-mt-4 font-display text-2xl font-bold text-ink-700 xs:text-3xl">
          Check your email
        </h1>
        <p className="mx-auto mt-2.5 max-w-md break-words text-sm leading-relaxed text-ink-500 xs:text-base">
          We&apos;ve sent a secure sign-in link to{" "}
          {email ? <strong className="text-ink-600">{email}</strong> : "your email"}. It expires in 15
          minutes.
        </p>

        <div className="mt-3.5 flex flex-col items-start gap-3 rounded-2xl bg-ink-50/70 p-3.5 text-left shadow-soft xs:flex-row xs:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink-700">Didn&apos;t receive the email?</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              Check your spam or promotions folder.
              <br />
              Still not there? <Link href="/login" className="font-bold text-ink-600 hover:text-blossom-600">Resend the link.</Link>
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="tap-target mt-3.5 flex w-full items-center justify-center gap-3 rounded-full bg-sage-50 py-2.5 text-base font-bold text-sage-700 shadow-soft transition-colors hover:bg-sage-100"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          Use a different email
        </Link>
      </main>
    </div>
  );
}
