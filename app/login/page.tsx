import type { Metadata } from "next";
import Image from "next/image";
import { BuyerLoginForm } from "@/components/store/buyer-login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Little Ilmies to access your purchase history and downloads.",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-cream via-blossom-50/40 to-ink-50/30 py-5 md:min-h-[calc(100vh-9rem)] md:py-6">
      <Image
        src="/images/star.png"
        alt=""
        width={46}
        height={46}
        className="pointer-events-none absolute left-14 top-28 h-9 w-9 rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/star.png"
        alt=""
        width={30}
        height={30}
        className="pointer-events-none absolute right-16 top-20 h-7 w-7 -rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/rainbow.png"
        alt=""
        width={120}
        height={70}
        className="pointer-events-none absolute -left-5 bottom-28 h-auto w-24 object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/rainbow.png"
        alt=""
        width={120}
        height={70}
        className="pointer-events-none absolute -right-6 bottom-32 h-auto w-24 scale-x-[-1] object-contain opacity-80"
        aria-hidden="true"
      />
      <Image
        src="/images/heart.png"
        alt=""
        width={28}
        height={28}
        className="pointer-events-none absolute right-1/4 top-36 h-6 w-6 rotate-12 object-contain opacity-80"
        aria-hidden="true"
      />

      <div className="container-content">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[2rem] border border-cream-50 bg-cream-50/90 shadow-lifted md:grid-cols-2">
          <div className="flex items-center justify-center px-6 py-7 sm:px-9 md:px-12 md:py-8">
            <BuyerLoginForm />
          </div>

          <div className="relative hidden min-h-[28rem] overflow-hidden bg-gradient-to-br from-blossom-50 via-cream-50 to-ink-50 md:block lg:min-h-[30rem]">
            <Image
              src="/images/login page.png"
              alt="Lantern, Islamic book, heart, and plant"
              fill
              sizes="680px"
              className="scale-110 object-contain p-2"
              priority
            />
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-md text-center">
          <div className="mx-auto flex max-w-44 items-center justify-center gap-3 text-lemon-400" aria-hidden="true">
            <span className="h-px flex-1 bg-ink-100" />
            <Image src="/images/star.png" alt="" width={22} height={22} className="h-5 w-5 object-contain" />
            <span className="h-px flex-1 bg-ink-100" />
          </div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-ink-600">
            Purchased before? Use the same email you checked out with to see your downloads.
          </p>
        </div>
      </div>
    </div>
  );
}
