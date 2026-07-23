import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight, Download, Printer, ShieldCheck, Heart } from "lucide-react";

const trustPoints = [
  { label: "Instant\nDownload", icon: Download },
  { label: "Printable\nat Home", icon: Printer },
  { label: "Trusted by\nThousands", icon: ShieldCheck },
  { label: "Made with\nLove", icon: Heart },
] as const;

export function ParentCta() {
  return (
    <section className="py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="relative overflow-hidden rounded-3xl px-6 py-14 text-center xs:px-10 xs:py-16 md:py-20">
          <Image
            src="/images/cta-section-bg.png"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink-700/20" />

          <div className="relative mx-auto max-w-xl">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-cream-50/30" aria-hidden="true" />
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cream-50/40">
                <BookOpen className="h-6 w-6 text-cream-50" aria-hidden="true" />
              </span>
              <span className="h-px w-10 bg-cream-50/30" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-display text-2xl font-semibold text-cream-50 xs:text-3xl md:text-4xl">
              Start building your child&apos;s Islamic learning library today.
            </h2>

            <span className="mx-auto mt-4 block h-px w-16 bg-cream-50/25" aria-hidden="true" />

            <p className="mt-4 text-sm text-cream-100/90 xs:text-base">
              Instant downloads, printable at home, and loved by thousands of
              Muslim families.
            </p>

            <Link
              href="/shop"
              className="tap-target mt-7 inline-flex items-center gap-2 rounded-full bg-blossom-500 px-7 py-3.5 text-sm font-semibold text-cream-50 shadow-lifted transition-all duration-200 hover:-translate-y-0.5 hover:bg-blossom-600 xs:text-base"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Explore All Books
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-4 xs:gap-x-6 md:gap-x-8">
            {trustPoints.map(({ label, icon: Icon }, i) => (
              <div key={label} className="flex items-center gap-4">
                {i > 0 && <span className="hidden h-8 w-px bg-cream-50/20 xs:block" aria-hidden="true" />}
                <div className="flex items-center gap-2.5 rounded-full bg-ink-700/35 px-3 py-2 backdrop-blur-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50/15">
                    <Icon className="h-4 w-4 text-cream-50" aria-hidden="true" />
                  </span>
                  <span className="whitespace-pre-line text-left text-xs font-medium leading-tight text-cream-100/90 xs:text-sm">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
