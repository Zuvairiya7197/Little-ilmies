import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HeroVideoBackground } from "@/components/store/home/hero-video-background";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-start justify-center overflow-hidden bg-cream-50 xs:min-h-[90vh]">
      <HeroVideoBackground />

      <div className="container-content relative flex flex-col items-center px-4 pb-16 pt-10 text-center xs:pt-14 md:pt-20">
        <span className="section-eyebrow animate-fade-up animate-float-sm inline-flex items-center gap-2 rounded-full border border-sage-200 bg-cream-50/80 px-4 py-1.5 shadow-soft backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-sage-600" aria-hidden="true" />
          Islamic &amp; educational e-books for kids
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
      </div>
    </section>
  );
}
