import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, Heart, ShieldCheck, Sparkles } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div className="container-content py-10 xs:py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-eyebrow">Our Story</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-700 xs:text-4xl">
          About Little Ilmies
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-500 xs:text-lg">
          Little Ilmies was founded by Zuvairiya Maryam to help Muslim parents nurture young
          minds with authentic Islamic knowledge — beautifully illustrated, instantly
          downloadable, and rooted firmly in the Qur&apos;an and Sunnah.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 xs:mt-14 xs:grid-cols-2">
        {values.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card-surface flex gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-ink-600">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-3xl bg-ink-500 px-6 py-10 text-center xs:mt-14 xs:px-10">
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
    </div>
  );
}
