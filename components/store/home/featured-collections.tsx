import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getFeaturedCategoryIcon, getFeaturedCategoryAccent } from "@/lib/category-display";
import type { Category } from "@/types/catalog";

/**
 * Static fallback shown only when fewer than 3 categories are flagged
 * isFeaturedOnHomepage in the DB (e.g. a fresh install before an admin has
 * curated any) — keeps the section from rendering an empty/broken grid.
 * Mirrors the 5 broad collections (Islamic + general learning) the DB rows
 * are normally flagged with, so this fallback stays on-message even if an
 * admin temporarily clears the featured flags.
 */
export const FALLBACK_COLLECTIONS: CollectionTileData[] = [
  {
    id: "islamic-studies",
    title: "Islamic Learning",
    description:
      "Build a meaningful foundation with books about faith, manners, Qur'an, duas, and everyday Islamic learning.",
    href: "/shop/islamic-studies",
    image: "/images/islamic-learning.png",
    ...getFeaturedCategoryAccent("ink"),
    icon: getFeaturedCategoryIcon("book-heart"),
  },
  {
    id: "early-learning",
    title: "Early Learning",
    description:
      "Make the early years more engaging with ABCs, numbers, shapes, vocabulary, and preschool learning.",
    href: "/shop/early-learning",
    image: "/images/early-learning.png",
    ...getFeaturedCategoryAccent("sunny"),
    icon: getFeaturedCategoryIcon("graduation-cap"),
  },
  {
    id: "science-and-nature",
    title: "Science & Nature",
    description:
      "Help little learners discover rain, plants, space, weather, and the fascinating world around them.",
    href: "/shop/science-and-nature",
    image: "/images/science-and-nature.png",
    ...getFeaturedCategoryAccent("teal"),
    icon: getFeaturedCategoryIcon("sparkles"),
  },
  {
    id: "activities-and-printables",
    title: "Activities & Printables",
    description:
      "Keep little hands learning with colouring, worksheets, tracing, activities, and creative printables.",
    href: "/shop/activities-and-printables",
    image: "/images/activities-and-printables.png",
    ...getFeaturedCategoryAccent("sage"),
    icon: getFeaturedCategoryIcon("pen-tool"),
  },
  {
    id: "life-skills",
    title: "Life Skills",
    description:
      "Introduce useful everyday skills through simple resources for cooking, healthy habits, practical learning, and independence.",
    href: "/shop/life-skills",
    image: "/images/life-skills.png",
    ...getFeaturedCategoryAccent("blossom"),
    icon: getFeaturedCategoryIcon("heart"),
  },
];

export interface CollectionTileData {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  icon: ReturnType<typeof getFeaturedCategoryIcon>;
  cardBg: string;
  badgeBg: string;
  titleColor: string;
  button: string;
}

/**
 * The Category record stays "Islamic Studies" everywhere it's used as the
 * real taxonomy name (admin, filters, nav, /shop/islamic-studies) — only
 * this homepage/collections card reads friendlier as "Islamic Learning",
 * so the override lives here rather than renaming the category itself.
 */
const HOMEPAGE_TITLE_OVERRIDES: Record<string, string> = {
  "islamic-studies": "Islamic Learning",
};

export function toCollectionTiles(categories: Category[]): CollectionTileData[] {
  return categories.map((category) => ({
    id: category.slug,
    title: HOMEPAGE_TITLE_OVERRIDES[category.slug] ?? category.name,
    description: category.description ?? "",
    href: `/shop/${category.slug}`,
    image: category.coverImage,
    icon: getFeaturedCategoryIcon(category.iconKey),
    ...getFeaturedCategoryAccent(category.accentColor),
  }));
}

export function CollectionCard({ title, description, href, icon: Icon, image, cardBg, badgeBg, titleColor, button }: CollectionTileData) {
  return (
    <Link
      href={href}
      aria-label={`Explore ${title}`}
      className={`group relative flex min-h-[190px] gap-3 overflow-hidden rounded-3xl p-5 shadow-clay transition-transform duration-300 hover:-translate-y-1 xs:min-h-[200px] ${cardBg}`}
    >
      <div className="relative z-10 flex w-1/2 shrink-0 flex-col items-start justify-center md:w-[45%]">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-cream-50 shadow-soft ${badgeBg}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className={`mt-2.5 font-display text-base font-semibold leading-snug xs:text-lg ${titleColor}`}>
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-500 xs:text-sm">{description}</p>
        <span
          className={`tap-target mt-3 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold text-cream-50 shadow-soft transition-colors xs:text-sm ${button}`}
        >
          Explore Now
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>

      <div className="relative -my-5 w-1/2 shrink-0 self-stretch md:w-[55%]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 480px) 50vw, 300px"
          className="scale-125 object-contain object-right transition-transform duration-300 group-hover:scale-[1.35] md:scale-150 md:group-hover:scale-[1.6]"
        />
      </div>
    </Link>
  );
}

function CollectionTile({ title, href, image, cardBg, titleColor }: CollectionTileData) {
  return (
    <Link
      href={href}
      className={`group flex aspect-[4/5] w-[42vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl pb-3 shadow-clay-sm xs:w-36 ${cardBg}`}
    >
      <div className="relative min-h-0 flex-1">
        <Image
          src={image}
          alt=""
          fill
          sizes="45vw"
          className="scale-125 object-contain p-1 transition-transform duration-300 group-hover:scale-[1.35]"
        />
      </div>
      <p className={`px-2 text-center text-sm font-semibold leading-tight ${titleColor}`}>{title}</p>
    </Link>
  );
}

/** Fewer than 3 curated categories would leave the 3-col desktop grid
 * looking broken (empty cells) — fall back to the static set in that case. */
export function resolveCollectionTiles(categories: Category[]): CollectionTileData[] {
  return categories.length >= 3 ? toCollectionTiles(categories) : FALLBACK_COLLECTIONS;
}

export function FeaturedCollections({ categories }: { categories: Category[] }) {
  const collections = resolveCollectionTiles(categories);
  // Desktop grid is a 3-up row followed by a 2-up row; when there are more
  // than 5, only show the first 5 so the curated layout never overflows.
  const gridCollections = collections.slice(0, 5);

  return (
    <section aria-labelledby="collections-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        {/* Mobile & tablet: compact heading + View all, matches app-style home design */}
        <div className="mb-5 flex items-end justify-between gap-4 md:hidden">
          <div>
            <p className="section-eyebrow inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Featured Collections
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-700">
              Curated for every learning moment
            </h2>
          </div>
          <Link
            href="/collections"
            className="shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
          {collections.map((collection) => (
            <li key={collection.id}>
              <CollectionTile {...collection} />
            </li>
          ))}
        </ul>

        {/* Desktop: full card grid with description + CTA, unchanged */}
        <div className="mx-auto mb-8 hidden max-w-xl text-center md:block xs:mb-10">
          <p className="section-eyebrow inline-flex items-center gap-1.5 justify-center">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Featured Collections
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </p>
          <h2 id="collections-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Curated for every learning moment
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
            Thoughtfully created e-books and activities to help children learn
            about their Deen, discover the world around them, build useful
            skills, and enjoy learning along the way.
          </p>
        </div>

        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {gridCollections.slice(0, 3).map((collection) => (
            <CollectionCard key={collection.id} {...collection} />
          ))}
        </div>
        {gridCollections.length > 3 && (
          <div className="mx-auto mt-4 hidden gap-4 md:grid md:w-2/3 md:grid-cols-2">
            {gridCollections.slice(3).map((collection) => (
              <CollectionCard key={collection.id} {...collection} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
