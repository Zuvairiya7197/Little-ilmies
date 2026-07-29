import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";

export function HeroSection({}: { products: ProductSummary[] }) {
  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}

/** Mobile & tablet: purple gradient card with playful image accents, matches
 * app-style home design. Desktop keeps the wide illustration hero below. */
function MobileHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-b from-ink-600 via-ink-500 to-ink-600 px-6 pb-9 pt-8 text-center md:hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src="/images/star.png"
          alt=""
          width={34}
          height={34}
          className="absolute left-[9%] top-[9%] h-8 w-8 object-contain opacity-90"
        />
        <Image
          src="/images/rainbow.png"
          alt=""
          width={74}
          height={74}
          className="absolute right-[5%] top-[5%] h-16 w-16 rotate-6 object-contain opacity-90"
        />
      </div>

      <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-50/15">
        <BookOpen className="h-6 w-6 text-cream-50" aria-hidden="true" />
      </span>

      <h1 className="relative mx-auto mt-5 max-w-xs font-display text-[1.7rem] font-semibold leading-[1.15] text-cream-50">
        Start building your child&apos;s Islamic learning library today.
      </h1>

      <p className="relative mx-auto mt-4 max-w-[19rem] text-sm leading-relaxed text-cream-100/85">
        Instant downloads, printable at home, and loved by thousands of Muslim
        families.
      </p>

      <Link
        href="/shop"
        className="tap-target relative mt-6 inline-flex items-center gap-2 rounded-full bg-blossom-400 px-6 py-3 text-sm font-semibold text-cream-50 shadow-clay-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-blossom-500 active:translate-y-0 active:scale-95"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Explore All Books
      </Link>

      <div className="relative mt-6 flex items-center justify-center gap-1.5" aria-hidden="true">
        <span className="h-1.5 w-4 rounded-full bg-cream-50" />
        <span className="h-1.5 w-1.5 rounded-full bg-cream-50/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-cream-50/40" />
      </div>
    </section>
  );
}

function DesktopHero() {
  return (
    <section className="relative z-0 mb-0 hidden aspect-[1717/916] max-h-[calc(100vh-140px)] w-full overflow-hidden bg-cream-50 md:block">
      <Image
        src="/images/hero-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-contain object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 from-[8%] via-cream-50/30 via-[30%] to-transparent xs:from-cream-50 xs:from-[20%] xs:via-cream-50/25 xs:via-[38%] xs:to-transparent" />

      <div className="container-content absolute inset-0 flex items-center">
        <div className="flex flex-col items-start text-left md:max-w-md">
          <h1 className="animate-fade-up max-w-lg font-display text-[2.25rem] font-semibold leading-[1.1] text-ink-700 [animation-delay:60ms] xs:text-4xl md:text-5xl">
            A Little Library
            <br />
            For Curious Hearts
          </h1>
          <span className="animate-fade-up mt-4 h-1 w-14 rounded-full bg-ink-400 [animation-delay:100ms]" aria-hidden="true" />

          <p className="animate-fade-up mt-5 max-w-md text-sm leading-relaxed text-ink-500 [animation-delay:140ms] xs:text-base">
            Explore printable Islamic and educational e-books designed for
            little learners.
          </p>
          <p className="animate-fade-up max-w-md text-sm leading-relaxed text-ink-500 [animation-delay:160ms] xs:text-base">
            Read online, print at home, or build your own growing library.
          </p>

          <div className="animate-fade-up mt-7 flex flex-col gap-3 [animation-delay:220ms] xs:flex-row">
            <Link href="/shop" className="btn-primary">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Browse Library
            </Link>
            <Link href="/shop?sort=newest" className="btn-secondary">
              <Star className="h-4 w-4" aria-hidden="true" />
              New Releases
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
