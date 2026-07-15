import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, Heart, ShieldCheck, Sparkles, User } from "lucide-react";
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
    title: "Rooted in authenticity",
    body: "Every story is sourced from the Qur'an and authentic Sunnah as understood by the Salaf-us-Salih — no unverified narrations, no shortcuts.",
  },
  {
    icon: Heart,
    title: "Made for little hearts",
    body: "Simple, warm language and gentle illustrations designed for how young children actually read, listen, and learn.",
  },
  {
    icon: ShieldCheck,
    title: "Built for parents' peace of mind",
    body: "You can hand a Little Ilmies book to your child and know exactly what they're learning.",
  },
  {
    icon: Sparkles,
    title: "Instant and printable",
    body: "Every book is a digital download you can read on screen or print at home, at madrasa, or for homeschooling.",
  },
];

const pillars = [
  {
    title: "Authentic Sources",
    body: "Every book is based on Qur'an and authentic Sunnah as understood by the Salaf-us-Salih, avoiding unverified stories.",
  },
  {
    title: "Pure Aqeedah",
    body: "Content focuses on correct Islamic belief and love for Tawheed, free from innovations.",
  },
  {
    title: "Truth Over Trends",
    body: "Building strong Islamic character rooted in authentic knowledge, not contemporary trends.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-content py-10 xs:py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-eyebrow">Our Story</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-700 xs:text-4xl">
          About Little Ilmies
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-500 xs:text-lg">
          Founded by Zuvairiya Maryam — nurturing young minds through pure, authentic Islamic
          teachings based on the understanding of the Salaf-us-Salih.
        </p>
      </div>

      <Reveal className="mx-auto mt-12 max-w-2xl xs:mt-14">
        <p className="section-eyebrow text-center">Meet the Founder</p>
        <div className="card-surface mt-4 flex flex-col gap-5 p-6 xs:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
              <User className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="font-display text-xl font-semibold text-ink-700">
              Zuvairiya Maryam
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink-500 xs:text-base">
            <p>
              Zuvairiya Maryam is a mother, graphic designer, and dedicated student of Islamic
              knowledge. With a deep love for clarity, authenticity, and child-centered
              education, she is passionate about raising children upon the pure teachings of
              Islam according to the Qur&apos;an and the authentic Sunnah, as understood by the
              Salaf-us-Salih (the righteous predecessors).
            </p>
            <p>
              Her work focuses on creating educational resources that help Muslim families
              nurture correct Aqeedah, love for Tawheed, and strong Islamic values from an early
              age. She believes that teaching children should be simple, accurate, and free from
              innovations or unverified stories, allowing them to grow up with a clear
              understanding of their faith.
            </p>
            <p>
              Through her books, designs, and printable resources, Zuvairiya aims to support
              parents in building a strong foundation of Islamic belief and character in their
              homes — one that is rooted in truth, not trends.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 xs:mt-14 xs:grid-cols-2">
        {values.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div className="card-surface flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-ink-600">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-400">{body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-12 max-w-3xl xs:mt-14">
        <div className="text-center">
          <p className="section-eyebrow">Our Foundation</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Our Commitment to Authenticity
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-500 xs:text-base">
            At Little Ilmies, we believe that knowledge is a gift from Allah that should be
            accessible to every child. Our mission is to provide authentic Islamic content based
            solely on the Qur&apos;an and verified Sunnah, strengthening faith and nurturing the
            intellectual and spiritual growth of young Muslims worldwide.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 xs:text-base">
            We carefully curate content that aligns with authentic Islamic sources while
            promoting academic excellence, ensuring that every book contributes to building
            confident, knowledgeable, and faithful future leaders — free from unconfirmed
            references and innovations.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 xs:mt-10 xs:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="card-surface p-5 text-center">
                <h3 className="font-display text-base font-semibold text-ink-600">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-12 max-w-2xl xs:mt-14">
        <div className="rounded-3xl bg-ink-500 px-6 py-10 text-center xs:px-10">
          <h2 className="font-display text-2xl font-semibold text-cream-50">
            Our Promise
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-cream-200 xs:text-base">
            All content is verified to be free from innovations and unconfirmed references,
            ensuring pure Islamic teachings for your children.
          </p>
          <Link href="/shop" className="btn-accent mt-6 inline-flex">
            Browse Our Books
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
