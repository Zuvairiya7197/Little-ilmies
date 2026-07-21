import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Moon,
  Languages,
  GraduationCap,
  Palette,
  HandHeart,
  Heart,
  Landmark,
  Star,
  Gift,
  Gamepad2,
  BookMarked,
  ArrowRight,
  Download,
  Printer,
  Baby,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import type { Category } from "@/types/catalog";

const tileTints = [
  "bg-ink-50 text-ink-600",
  "bg-blossom-50 text-blossom-500",
  "bg-sage-50 text-sage-600",
  "bg-sunny-50 text-sunny-600",
  "bg-teal-50 text-teal-600",
  "bg-ink-50 text-ink-600",
] as const;

function findCategory(categories: Category[], slug: string) {
  return categories.find((c) => c.slug === slug);
}

function sumBookCount(categories: Category[], slugs: string[]) {
  return categories
    .filter((c) => slugs.includes(c.slug))
    .reduce((sum, c) => sum + c.bookCount, 0);
}

export function CategoriesView({ categories }: { categories: Category[] }) {
  const tiles = [
    {
      label: "Islamic Books",
      href: "/shop/islamic-books",
      icon: Moon,
      count: sumBookCount(categories, [
        "stories-of-the-prophets",
        "mothers-of-the-ummah",
        "ashrah-al-mubashsharah",
        "stories-from-the-quran",
        "dua-and-prayers-for-kids",
        "islamic-manners-and-character",
        "kids-islamic-activity-books",
      ]),
      unit: "Books",
    },
    {
      label: "Arabic for Kids",
      href: "/shop/arabic-for-kids",
      icon: Languages,
      count: findCategory(categories, "arabic-for-kids")?.bookCount ?? 0,
      unit: "Books",
    },
    {
      label: "Educational Books",
      href: "/shop/educational-books",
      icon: GraduationCap,
      count: sumBookCount(categories, [
        "preschool-learning",
        "coloring-books",
        "math-for-kids",
        "english-for-kids",
        "arabic-for-kids",
        "marathi-for-kids",
        "hindi-for-kids",
      ]),
      unit: "Books",
    },
    {
      label: "Printable Activities",
      href: "/shop/coloring-books",
      icon: Palette,
      count: findCategory(categories, "coloring-books")?.bookCount ?? 0,
      unit: "Activities",
    },
    {
      label: "Ramadan Collection",
      href: "/shop/dua-and-prayers-for-kids",
      icon: BookMarked,
      count: findCategory(categories, "dua-and-prayers-for-kids")?.bookCount ?? 0,
      unit: "Books",
    },
    {
      label: "Du'a & Prayers",
      href: "/shop/dua-and-prayers-for-kids",
      icon: HandHeart,
      count: findCategory(categories, "dua-and-prayers-for-kids")?.bookCount ?? 0,
      unit: "Books",
    },
    {
      label: "Character & Akhlaq",
      href: "/shop/islamic-manners-and-character",
      icon: Heart,
      count: findCategory(categories, "islamic-manners-and-character")?.bookCount ?? 0,
      unit: "Books",
    },
    {
      label: "Stories of Prophets",
      href: "/shop/stories-of-the-prophets",
      icon: Landmark,
      count: findCategory(categories, "stories-of-the-prophets")?.bookCount ?? 0,
      unit: "Books",
    },
    {
      label: "Best Sellers",
      href: "/shop?sort=bestselling",
      icon: Star,
      count: 0,
      unit: "",
    },
    {
      label: "Bundles & Collections",
      href: "/shop?bundle=all",
      icon: Gift,
      count: 0,
      unit: "Bundles",
    },
    {
      label: "Games & Gifts",
      href: "/shop/games-and-gifts",
      icon: Gamepad2,
      count: findCategory(categories, "games-and-gifts")?.bookCount ?? 0,
      unit: "Items",
    },
    {
      label: "New Arrivals",
      href: "/shop?sort=newest",
      icon: BookOpen,
      count: 0,
      unit: "Books",
    },
  ].filter((tile) => tile.count > 0 || tile.unit === "");

  const badges = [
    { label: "Instant Download", description: "Start reading right away", icon: Download, iconBg: "bg-ink-50", iconColor: "text-ink-500" },
    { label: "Printable at Home", description: "Easy to print & use", icon: Printer, iconBg: "bg-sage-50", iconColor: "text-sage-600" },
    { label: "Kid Friendly", description: "Safe & suitable for all ages", icon: Baby, iconBg: "bg-teal-50", iconColor: "text-teal-600" },
    { label: "Secure Checkout", description: "100% safe & trusted", icon: ShieldCheck, iconBg: "bg-sunny-50", iconColor: "text-sunny-600" },
  ] as const;

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <div className="mb-6 xs:mb-8">
        <h1 className="inline-flex items-center gap-2 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
          All Categories
          <Sparkles className="h-6 w-6 text-lemon-400" aria-hidden="true" />
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-400 xs:text-base">
          Explore all our book collections and activities.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 xs:gap-3.5">
        {tiles.map(({ label, href, icon: Icon, count, unit }, i) => {
          const tint = tileTints[i % tileTints.length];
          return (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-center rounded-3xl bg-cream-50 p-3 text-center shadow-clay-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-clay xs:p-4"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full xs:h-14 xs:w-14 ${tint}`}>
                <Icon className="h-5 w-5 xs:h-6 xs:w-6" aria-hidden="true" />
              </span>
              <p className="mt-2.5 line-clamp-2 font-display text-xs font-semibold leading-snug text-ink-700 xs:text-sm">
                {label}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                {unit && (
                  <span className="text-[11px] text-ink-300 xs:text-xs">
                    {count} {unit}
                  </span>
                )}
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tint} transition-transform group-hover:translate-x-0.5`}>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-4 gap-2 rounded-3xl bg-cream-50 p-4 shadow-lifted xs:gap-3 xs:p-5">
        {badges.map(({ label, description, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="flex flex-col items-start gap-2">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full xs:h-9 xs:w-9 ${iconBg}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-tight text-ink-600 xs:text-xs">{label}</p>
              <p className="mt-0.5 hidden text-[10px] leading-tight text-ink-300 xs:block">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/about"
        className="group relative mt-6 flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-700 via-ink-600 to-ink-800 p-6 shadow-clay"
      >
        <Star className="absolute left-4 top-4 h-4 w-4 fill-cream-50/70 text-cream-50/70" aria-hidden="true" />
        <Star className="absolute right-4 top-4 h-3.5 w-3.5 fill-sunny-400/80 text-sunny-400/80" aria-hidden="true" />

        <div aria-hidden="true" className="relative h-16 w-20 shrink-0 xs:h-20 xs:w-24">
          <Image src="/images/age-6-9.png" alt="" fill sizes="96px" className="object-contain object-center" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sunny-400">
            Authentic &amp; Trusted
          </span>
          <h2 className="mt-1 font-display text-base font-semibold leading-snug text-cream-50 xs:text-lg">
            Quality content you can trust.
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-cream-100/80 xs:text-sm">
            All books are created with authentic references and made for
            little hearts.
          </p>
          <span className="tap-target mt-3 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-blossom-500 px-3.5 py-2 text-xs font-semibold text-cream-50 shadow-soft transition-transform group-hover:translate-x-0.5">
            Learn More
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </div>
  );
}
