import Image from "next/image";
import Link from "next/link";
import { BookHeart, Sparkles, Moon, Languages, PenTool } from "lucide-react";

const collections = [
  {
    title: "Stories of the Prophets",
    description: "Authentic tales retold for young hearts.",
    href: "/shop/stories-of-the-prophets",
    icon: BookHeart,
    image: "/images/collection-stories-of-the-prophets.png",
    cardBg: "bg-ink-50",
    badgeBg: "bg-ink-500",
    titleColor: "text-ink-700",
    button: "bg-ink-400 hover:bg-ink-500",
  },
  {
    title: "Good Manners Collection",
    description: "Building akhlaq, one habit at a time.",
    href: "/shop/islamic-manners-and-character",
    icon: Sparkles,
    image: "/images/collection-good-manners.png",
    cardBg: "bg-sunny-50",
    badgeBg: "bg-sunny-500",
    titleColor: "text-sunny-800",
    button: "bg-sunny-500 hover:bg-sunny-600",
  },
  {
    title: "Ramadan Collection",
    description: "Duas, stories, and activities for the blessed month.",
    href: "/shop/dua-and-prayers-for-kids",
    icon: Moon,
    image: "/images/collection-ramadan.png",
    cardBg: "bg-teal-50",
    badgeBg: "bg-teal-500",
    titleColor: "text-teal-800",
    button: "bg-teal-500 hover:bg-teal-600",
  },
  {
    title: "Learning Arabic",
    description: "First steps in reading and writing Arabic.",
    href: "/shop/arabic-for-kids",
    icon: Languages,
    image: "/images/collection-learning-arabic.png",
    cardBg: "bg-blossom-50",
    badgeBg: "bg-blossom-500",
    titleColor: "text-blossom-700",
    button: "bg-blossom-500 hover:bg-blossom-600",
  },
  {
    title: "Printable Activities",
    description: "Coloring pages and activity books for quiet afternoons.",
    href: "/shop/coloring-books",
    icon: PenTool,
    image: "/images/collection-printable-activities.png",
    cardBg: "bg-sage-50",
    badgeBg: "bg-sage-500",
    titleColor: "text-sage-800",
    button: "bg-sage-500 hover:bg-sage-600",
  },
] as const;

function CollectionCard({
  title,
  description,
  href,
  icon: Icon,
  image,
  cardBg,
  badgeBg,
  titleColor,
  button,
}: (typeof collections)[number]) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[190px] items-center gap-3 overflow-hidden rounded-3xl p-5 shadow-clay transition-transform duration-300 hover:-translate-y-1 xs:min-h-[200px] ${cardBg}`}
    >
      <div className="relative z-10 flex w-1/2 shrink-0 flex-col items-start">
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

      <div className="relative -my-3 h-[calc(100%+1.5rem)] w-1/2 shrink-0">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 480px) 50vw, 300px"
          className="object-contain object-right scale-125 transition-transform duration-300 group-hover:scale-[1.35]"
        />
      </div>
    </Link>
  );
}

function CollectionTile({ title, href, image, cardBg, titleColor }: (typeof collections)[number]) {
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

export function FeaturedCollections() {
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
            href="/shop"
            className="shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
          {collections.map((collection) => (
            <li key={collection.title}>
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
            Explore handpicked e-books and activities that inspire faith,
            build character, and make learning delightful.
          </p>
        </div>

        <div className="hidden grid-cols-1 gap-4 xs:grid-cols-2 md:grid lg:grid-cols-3">
          {collections.slice(0, 3).map((collection) => (
            <CollectionCard key={collection.title} {...collection} />
          ))}
        </div>
        <div className="mx-auto mt-4 hidden grid-cols-1 gap-4 xs:grid-cols-2 md:grid lg:w-2/3">
          {collections.slice(3).map((collection) => (
            <CollectionCard key={collection.title} {...collection} />
          ))}
        </div>
      </div>
    </section>
  );
}
