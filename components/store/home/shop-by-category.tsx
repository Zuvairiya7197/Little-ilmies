"use client";

import Link from "next/link";
import { BookOpen, Landmark, HandHeart, Heart, GraduationCap, PenTool, Palette, LayoutGrid } from "lucide-react";
import type { Category } from "@/types/catalog";

/** Curated icon + label per real category slug, echoing the reference
 * store's circular category row. Falls back to a generic icon/label for
 * any category slug not explicitly mapped, so new categories never vanish. */
const CATEGORY_DISPLAY: Record<string, { label: string; icon: typeof BookOpen; tint: string }> = {
  "islamic-studies": { label: "Islamic Studies", icon: Landmark, tint: "bg-sunny-50 text-sunny-600" },
  "quran-and-arabic": { label: "Qur'an & Arabic", icon: BookOpen, tint: "bg-sage-50 text-sage-600" },
  "early-learning": { label: "Early Learning", icon: GraduationCap, tint: "bg-ink-50 text-ink-600" },
  "languages": { label: "Languages", icon: BookOpen, tint: "bg-teal-50 text-teal-600" },
  "character-building": { label: "Character", icon: Heart, tint: "bg-blossom-50 text-blossom-600" },
  "creative-learning": { label: "Creative", icon: Palette, tint: "bg-sage-50 text-sage-600" },
  "games-and-activities": { label: "Activities", icon: PenTool, tint: "bg-lemon-50 text-lemon-600" },
  "life-skills": { label: "Life Skills", icon: HandHeart, tint: "bg-teal-50 text-teal-600" },
};

const FALLBACK_TINTS = ["bg-ink-50 text-ink-600", "bg-sunny-50 text-sunny-600", "bg-lemon-50 text-lemon-600", "bg-teal-50 text-teal-600", "bg-blossom-50 text-blossom-600", "bg-sage-50 text-sage-600"];

export function ShopByCategory({ categories }: { categories: Category[] }) {
  const shown = categories
    .filter((cat) => CATEGORY_DISPLAY[cat.slug])
    .sort((a, b) => Object.keys(CATEGORY_DISPLAY).indexOf(a.slug) - Object.keys(CATEGORY_DISPLAY).indexOf(b.slug));
  const rest = categories.filter((cat) => !CATEGORY_DISPLAY[cat.slug]);
  const displayList = [...shown, ...rest].slice(0, 7);

  return (
    <section id="categories" aria-labelledby="categories-heading" className="pb-10 pt-2 xs:pb-12 md:pb-16">
      <div className="container-content">
        <h2 id="categories-heading" className="sr-only">
          Shop by category
        </h2>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 xs:gap-6 md:mx-0 md:flex-wrap md:justify-center md:gap-8 md:overflow-visible md:px-0">
          {displayList.map((cat, i) => {
            const display = CATEGORY_DISPLAY[cat.slug];
            const Icon = display?.icon ?? LayoutGrid;
            const tint = display?.tint ?? FALLBACK_TINTS[i % FALLBACK_TINTS.length];
            return (
              <li key={cat.slug} className="w-20 shrink-0 snap-start xs:w-24">
                <Link href={`/shop/${cat.slug}`} className="group flex flex-col items-center gap-2">
                  <span
                    className={`tap-target flex aspect-square w-16 items-center justify-center rounded-full shadow-clay-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-clay xs:w-20 ${tint}`}
                  >
                    <Icon className="h-6 w-6 xs:h-7 xs:w-7" aria-hidden="true" />
                  </span>
                  <p className="line-clamp-2 text-center text-xs font-semibold leading-tight text-ink-600 xs:text-sm">
                    {display?.label ?? cat.name}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 text-center md:hidden">
          <Link href="/shop" className="text-sm font-semibold text-sage-700 underline-offset-4 hover:underline">
            View all categories
          </Link>
        </div>
      </div>
    </section>
  );
}
