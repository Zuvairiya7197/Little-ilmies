import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,theme(colors.sage.100),transparent_45%),radial-gradient(circle_at_85%_10%,theme(colors.gold.100),transparent_40%)]" />

      <div className="container-content relative grid grid-cols-1 gap-10 py-10 xs:py-12 md:grid-cols-2 md:items-center md:gap-8 md:py-20">
        <div className="animate-fade-up">
          <span className="section-eyebrow inline-flex items-center gap-2 rounded-full border border-sage-200 bg-sage-50 px-4 py-1.5">
            Trusted by 10,000+ Muslim families
          </span>

          <h1 className="mt-5 max-w-xl font-display text-[2rem] font-semibold leading-[1.15] text-ink-700 xs:text-[2.25rem] md:text-5xl">
            Beautiful Islamic &amp; Educational E-Books for Young Hearts
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-400 xs:text-lg">
            Authentic, printable, child-friendly digital books designed to
            nurture faith, learning, manners, and creativity.
          </p>

          <div className="mt-7 flex flex-col gap-3 xs:flex-row">
            <Link href="/shop" className="btn-primary">
              Browse Books
            </Link>
            <Link href="/shop/islamic-books" className="btn-secondary">
              View Islamic Collection
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-ink-400">
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
              ))}
            </div>
            <span>4.9 out of 5 from 800+ parents</span>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-sm animate-fade-up md:max-w-none [animation-delay:120ms]">
          <div className="absolute inset-4 rounded-[2rem] bg-sage-100/60 xs:inset-6" />

          <div className="absolute left-[8%] top-[10%] w-[42%] -rotate-6 rounded-xl bg-cream-50 p-1.5 shadow-lifted xs:w-[38%]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-200">
              <Image
                src="/images/products/stories-of-the-prophets.svg"
                alt="Stories of the Prophets book cover"
                fill
                sizes="200px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="absolute right-[6%] top-[18%] w-[42%] rotate-3 rounded-xl bg-cream-50 p-1.5 shadow-lifted xs:w-[38%]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-200">
              <Image
                src="/images/products/asma-ul-husna-real.png"
                alt="Asma Ul-Husna book cover"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="absolute bottom-[8%] left-[20%] w-[46%] rotate-2 rounded-xl bg-cream-50 p-1.5 shadow-lifted xs:w-[42%]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-200">
              <Image
                src="/images/products/dua-and-prayers.svg"
                alt="Du'a and Prayers for Kids book cover"
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="absolute bottom-6 right-2 flex items-center gap-2 rounded-2xl bg-cream-50 px-3 py-2 shadow-lifted xs:right-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-sm">
              📖
            </span>
            <div className="text-left">
              <p className="text-[11px] font-semibold leading-tight text-ink-600">
                Instant Preview
              </p>
              <p className="text-[10px] leading-tight text-ink-300">
                Flip through 5 free pages
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
