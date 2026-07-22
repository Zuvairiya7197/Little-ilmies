import Image from "next/image";
import Link from "next/link";
import { BookOpen, GraduationCap, Palette, Gift, Sparkles, ArrowRight } from "lucide-react";

const explore = [
  {
    title: "Browse Islamic Books",
    description: "Discover stories, learning, and Qur'an resources for every age.",
    href: "/shop/islamic-books",
    icon: BookOpen,
    image: "/images/explore-islamic-books.png",
    cardBg: "bg-ink-50",
    badgeBg: "bg-cream-50",
    iconColor: "text-ink-400",
    linkColor: "text-ink-400",
  },
  {
    title: "Browse Educational Books",
    description: "Language, math, and core learning essentials.",
    href: "/shop/educational-books",
    icon: GraduationCap,
    image: "/images/explore-educational-books.png",
    cardBg: "bg-teal-50",
    badgeBg: "bg-cream-50",
    iconColor: "text-teal-500",
    linkColor: "text-teal-600",
  },
  {
    title: "Browse Printable Activities",
    description: "Creative pages and hands-on activities to make learning fun.",
    href: "/shop/coloring-books",
    icon: Palette,
    image: "/images/explore-printable-activities.png",
    cardBg: "bg-sunny-50",
    badgeBg: "bg-cream-50",
    iconColor: "text-sunny-500",
    linkColor: "text-sunny-600",
  },
  {
    title: "Browse Bundles",
    description: "Curated collections to learn more and save more.",
    href: "/shop?bundle=all",
    icon: Gift,
    image: "/images/explore-bundles.png",
    cardBg: "bg-blossom-50",
    badgeBg: "bg-cream-50",
    iconColor: "text-blossom-400",
    linkColor: "text-blossom-500",
  },
] as const;

export function ExploreMore() {
  return (
    <section aria-labelledby="explore-more-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mb-8 max-w-lg xs:mb-10">
          <p className="section-eyebrow inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Keep Exploring
          </p>
          <h2 id="explore-more-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Explore More
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-400 xs:text-base">
            More ways to learn, grow, and build a strong foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {explore.map(({ title, description, href, icon: Icon, image, cardBg, badgeBg, iconColor, linkColor }) => (
            <Link
              key={title}
              href={href}
              className={`group relative flex min-h-[150px] items-center gap-4 overflow-hidden rounded-3xl p-5 shadow-clay-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-clay xs:gap-5 xs:p-6 ${cardBg}`}
            >
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft ${badgeBg}`}>
                <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold leading-snug text-ink-700 xs:text-lg">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-400 xs:text-sm">{description}</p>
              </div>

              <span
                className={`ml-1 hidden shrink-0 items-center gap-1.5 border-l border-ink-100 pl-4 text-sm font-semibold xs:flex ${linkColor}`}
              >
                Browse
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>

              <div className="relative hidden h-full w-24 shrink-0 sm:block">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
