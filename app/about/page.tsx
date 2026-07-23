import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  BookOpenCheck,
  Download,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Little Ilmies helps Muslim parents nurture young hearts through authentic Islamic and educational e-books, built on Qur'an and authentic Sunnah.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: BookOpenCheck,
    title: "Rooted in Authenticity",
    body: "Every story is curated from the Qur'an and authentic Sunnah as understood by the Salaf-us-Salih — no unverified narrations, no shortcuts.",
    tint: "bg-blossom-50 text-blossom-500",
  },
  {
    icon: Heart,
    title: "Made for Little Hearts",
    body: "Simple, warm language and gentle illustrations designed for how young children actually read, listen, and learn.",
    tint: "bg-blossom-50 text-blossom-500",
  },
  {
    icon: ShieldCheck,
    title: "Built for Parents' Peace of Mind",
    body: "You can hand a Little Ilmies book to your child and know exactly what they're learning.",
    tint: "bg-ink-50 text-ink-400",
  },
  {
    icon: Download,
    title: "Instant and Printable",
    body: "Every book is a digital download you can read on screen or print at home, at madrasah, or for homeschooling.",
    tint: "bg-gold-50 text-gold-500",
  },
] as const;

const pillars = [
  {
    icon: BookOpen,
    title: "Authentic Sources",
    body: "Every book is based on Qur'an and authentic Sunnah as understood by the Salaf-us-Salih, avoiding unverified stories.",
    tint: "bg-sage-50 text-sage-600",
  },
  {
    icon: Sparkles,
    title: "Pure Aqeedah",
    body: "Content focuses on correct Islamic belief and love for Tawheed, free from innovations.",
    tint: "bg-ink-50 text-ink-400",
  },
  {
    icon: Star,
    title: "Truth Over Trends",
    body: "Building strong Islamic character rooted in authentic knowledge, not contemporary trends.",
    tint: "bg-sunny-50 text-sunny-500",
  },
] as const;

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-ink-500">
      <span className="text-sunny-400">✦</span>
      {children}
      <span className="text-sage-500">✦</span>
    </p>
  );
}

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden pb-14 pt-10 xs:pt-12 md:pb-20 md:pt-16">
      <div className="pointer-events-none absolute left-8 top-44 hidden md:block" aria-hidden="true">
        <div className="h-14 w-14 rounded-full bg-sage-100 shadow-soft" />
        <div className="-mt-3 ml-16 h-16 w-16 rotate-12 rounded-2xl bg-ink-100 shadow-soft" />
      </div>
      <div className="pointer-events-none absolute right-12 top-44 hidden md:block" aria-hidden="true">
        <div className="h-20 w-24 rounded-[2rem] bg-gradient-to-b from-sunny-100 to-blossom-100 shadow-soft" />
        <div className="-mt-4 ml-9 h-5 w-20 rounded-full bg-ink-100 shadow-soft" />
        <div className="ml-5 mt-2 h-5 w-20 rounded-full bg-sage-100 shadow-soft" />
      </div>
      <div className="pointer-events-none absolute bottom-96 left-8 hidden h-7 w-7 rotate-12 rounded-lg bg-blossom-200 shadow-soft md:block" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[28rem] right-12 hidden h-7 w-7 -rotate-12 rounded-lg bg-sage-200 shadow-soft md:block" aria-hidden="true" />

      <div className="container-content relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Our Story</SectionEyebrow>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink-600 xs:text-5xl md:text-6xl">
            About Little Ilmies <span className="text-blossom-400">♥</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-ink-500 xs:text-lg">
            Founded by{" "}
            <Link
              href="https://zuvi.zarrarpalekar.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink-600 underline decoration-blossom-300 decoration-2 underline-offset-4 hover:text-blossom-600"
            >
              Zuvairiya Maryam
            </Link>{" "}
            — nurturing young minds through pure, authentic Islamic teachings based on the
            understanding of the Salaf-us-Salih.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-5xl">
          <SectionEyebrow>Meet the Founder</SectionEyebrow>
          <div className="mt-6 rounded-3xl bg-cream-50 p-6 shadow-clay sm:p-8 md:p-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div className="flex flex-col gap-6 md:border-r md:border-ink-100 md:pr-10">
                <div className="flex items-center gap-5">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600 shadow-soft">
                    <User className="h-9 w-9" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-ink-700">
                      <Link
                        href="https://zuvi.zarrarpalekar.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-blossom-300 decoration-2 underline-offset-4 hover:text-blossom-600"
                      >
                        Zuvairiya Maryam
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-500">
                      Zuvairiya Maryam is a mother, graphic designer, and dedicated student of
                      Islamic knowledge.
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-loose text-ink-500 xs:text-base">
                  With a deep love for clarity, authenticity, and child-centered education, she is
                  passionate about raising children upon the pure teachings of Islam according to the
                  Qur&apos;an and the authentic Sunnah, as understood by the Salaf-us-Salih (the righteous
                  predecessors).
                </p>
              </div>

              <div className="flex flex-col gap-5 text-sm leading-loose text-ink-500 xs:text-base">
                <p>
                  Her work focuses on creating educational resources that help Muslim families
                  nurture correct Aqeedah, love for Tawheed, and strong Islamic values from an early
                  age. She believes that teaching children should be simple, accurate, and free from
                  innovations or unverified stories.
                </p>
                <p>
                  Through her books, designs, and printable resources, Zuvairiya aims to support
                  parents in building a strong foundation of Islamic belief and character in their
                  homes — one that is rooted in truth, not trends.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mx-auto mt-7 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:mt-8">
          {values.map(({ icon: Icon, title, body, tint }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex h-full items-center gap-5 rounded-3xl bg-cream-50 p-6 shadow-clay-sm">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-soft ${tint}`}>
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-700">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-14 max-w-4xl text-center md:mt-16">
          <SectionEyebrow>Our Foundation</SectionEyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
            Our Commitment to Authenticity
          </h2>
          <div className="mx-auto mt-4 flex max-w-48 items-center justify-center gap-3 text-blossom-400" aria-hidden="true">
            <span className="h-px flex-1 bg-blossom-300" />
            <Heart className="h-4 w-4 fill-blossom-400" />
            <span className="h-px flex-1 bg-blossom-300" />
          </div>
          <p className="mx-auto mt-7 max-w-3xl text-base font-medium leading-relaxed text-ink-500">
            At Little Ilmies, we believe that knowledge is a gift from Allah that should be
            accessible to every child. Our mission is to provide authentic Islamic content based
            solely on the Qur&apos;an and verified Sunnah, strengthening faith and nurturing the
            intellectual and spiritual growth of young Muslims worldwide.
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-relaxed text-ink-500">
            We carefully curate content that aligns with authentic Islamic sources while promoting
            academic excellence, ensuring that every book contributes to building confident,
            knowledgeable, and faithful future leaders — free from unconfirmed references and
            innovations.
          </p>
        </Reveal>

        <div className="mx-auto mt-9 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body, tint }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex h-full gap-5 rounded-3xl bg-cream-50 p-6 shadow-clay-sm">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-soft ${tint}`}>
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-700">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-9 max-w-6xl md:mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-600 via-ink-500 to-gold-600 px-6 py-10 text-center shadow-lifted sm:px-10 md:py-12">
            <div className="absolute -bottom-10 -left-5 h-36 w-36 rounded-[2rem] bg-cream-50/10" aria-hidden="true" />
            <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-cream-50/10" aria-hidden="true" />
            <Sparkles className="absolute left-1/4 top-8 h-5 w-5 text-cream-50/40" aria-hidden="true" />
            <Heart className="absolute bottom-12 left-20 h-8 w-8 fill-blossom-300 text-blossom-300" aria-hidden="true" />
            <h2 className="font-display text-3xl font-bold text-cream-50">Our Promise</h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-cream-50/90">
              All content is verified to be free from innovations and unconfirmed references,
              ensuring pure Islamic teachings for your children.
            </p>
            <Link href="/shop" className="btn-accent mt-7 inline-flex bg-blossom-400 hover:bg-blossom-500">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Browse Our Books
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
