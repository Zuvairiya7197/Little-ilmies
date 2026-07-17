import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";

export function HeroSection({}: { products: ProductSummary[] }) {
  return (
    <section className="relative aspect-[3/2] max-h-[80vh] w-full overflow-hidden bg-cream-50 xs:aspect-[16/9] md:aspect-[1717/916] md:max-h-[calc(100vh-140px)]">
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
