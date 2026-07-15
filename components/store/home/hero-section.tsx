import Link from "next/link";
import { Star } from "lucide-react";
import { HeroVideoBackground } from "@/components/store/home/hero-video-background";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-start justify-center overflow-hidden bg-cream-50 xs:min-h-[90vh]">
      <HeroVideoBackground />

      <div className="container-content relative flex flex-col items-center px-4 pb-16 pt-10 text-center xs:pt-14 md:pt-20">
        <span className="section-eyebrow animate-fade-up animate-float-sm inline-flex items-center gap-2 rounded-full border border-sage-200 bg-cream-50/80 px-4 py-1.5 shadow-soft backdrop-blur-md">
          Trusted by 10,000+ Muslim families
        </span>

        <h1 className="animate-fade-up mt-6 max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.1] text-ink-700 [animation-delay:80ms] xs:text-[2.75rem] md:text-6xl">
          Beautiful Islamic &amp; Educational{" "}
          <span className="italic text-sage-700">E-Books</span> for Young
          Hearts
        </h1>

        <p className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-ink-600 [animation-delay:160ms] xs:text-lg">
          Authentic, printable, child-friendly digital books designed to
          nurture faith, learning, manners, and creativity.
        </p>

        <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:240ms] xs:flex-row">
          <Link href="/shop" className="btn-primary">
            Browse Books
          </Link>
          <Link
            href="/shop/islamic-books"
            className="btn-secondary bg-cream-50/85 backdrop-blur-md"
          >
            View Islamic Collection
          </Link>
        </div>

        <div className="animate-fade-up mt-8 flex items-center gap-3 rounded-full bg-cream-50/70 px-4 py-2 text-sm text-ink-600 shadow-soft backdrop-blur-md [animation-delay:320ms]">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 animate-gentle-bounce fill-gold-400 text-gold-400"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
          <span>4.9 out of 5 from 800+ parents</span>
        </div>
      </div>
    </section>
  );
}
