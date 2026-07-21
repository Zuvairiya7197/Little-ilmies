import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Moon,
  FlaskConical,
  BookOpen,
  Heart,
  Feather,
  Palette,
  Lightbulb,
  ArrowRight,
  Sprout,
  Star,
} from "lucide-react";

const goals = [
  {
    title: "Early Learning",
    description: "Fun activities and books to build skills for a bright start.",
    href: "/shop/preschool-learning",
    icon: GraduationCap,
    image: "/images/goal-early-learning.png",
    cardBg: "bg-sage-50",
    iconBg: "bg-sage-500",
    titleColor: "text-sage-800",
  },
  {
    title: "Islamic Studies",
    description: "Learn about Islam through engaging stories, lessons and activities.",
    href: "/shop/islamic-books",
    icon: Moon,
    image: "/images/goal-islamic-studies.png",
    cardBg: "bg-sunny-50",
    iconBg: "bg-sunny-500",
    titleColor: "text-sunny-800",
  },
  {
    title: "STEM Learning",
    description: "Explore science, technology, engineering and math in a fun way.",
    href: "/shop/math-for-kids",
    icon: FlaskConical,
    image: "/images/goal-stem-learning.png",
    cardBg: "bg-ink-50",
    iconBg: "bg-ink-500",
    titleColor: "text-ink-700",
  },
  {
    title: "Quran & Arabic",
    description: "Help your child love the Quran and the beauty of Arabic.",
    href: "/shop/arabic-for-kids",
    icon: BookOpen,
    image: "/images/goal-quran-arabic.png",
    cardBg: "bg-teal-50",
    iconBg: "bg-teal-500",
    titleColor: "text-teal-800",
  },
  {
    title: "Character Building",
    description: "Stories and activities that build good values and habits.",
    href: "/shop/islamic-manners-and-character",
    icon: Heart,
    image: "/images/goal-character-building.png",
    cardBg: "bg-blossom-50",
    iconBg: "bg-blossom-500",
    titleColor: "text-blossom-700",
  },
  {
    title: "Islamic Stories",
    description: "Inspiring stories of the Prophets and great muslim role models.",
    href: "/shop/stories-of-the-prophets",
    icon: Feather,
    image: "/images/goal-islamic-stories.png",
    cardBg: "bg-sunny-50",
    iconBg: "bg-sunny-500",
    titleColor: "text-sunny-800",
  },
  {
    title: "Creative Arts",
    description: "Encourage creativity with art, crafts and imaginative activities.",
    href: "/shop/coloring-books",
    icon: Palette,
    image: "/images/goal-creative-arts.png",
    cardBg: "bg-sage-50",
    iconBg: "bg-sage-500",
    titleColor: "text-sage-800",
  },
  {
    title: "Life Skills",
    description: "Practical books and activities for everyday life and confidence.",
    href: "/shop/kids-islamic-activity-books",
    icon: Lightbulb,
    image: "/images/goal-life-skills.png",
    cardBg: "bg-lemon-50",
    iconBg: "bg-lemon-500",
    titleColor: "text-lemon-800",
  },
] as const;

export function ShopByLearningGoal() {
  return (
    <section aria-label="Shop by learning goal" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        {/* Mobile & tablet: left-aligned heading with a decorative book-stack graphic, matches app-style home design */}
        <div className="relative mb-8 flex items-center gap-4 overflow-hidden md:hidden">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sage-600">
              <GraduationCap className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
              Shop by Learning Goal
            </span>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-ink-700 xs:text-2xl">
              What do you want your child to <span className="text-blossom-600">learn?</span>
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-400">
              Browse by topic and find the perfect books and activities for
              their growing minds and hearts.
            </p>
          </div>

          <div aria-hidden="true" className="relative hidden h-28 w-24 shrink-0 xs:block">
            <Star className="absolute -top-1 right-2 h-4 w-4 fill-blossom-400 text-blossom-400" />
            <Star className="absolute right-8 top-6 h-3 w-3 fill-sunny-400 text-sunny-400" />
            <span className="absolute bottom-0 left-0 flex h-9 w-9 items-center justify-center rounded-full bg-sage-100">
              <Sprout className="h-4 w-4 text-sage-600" aria-hidden="true" />
            </span>
            <div className="absolute bottom-2 left-8 h-9 w-16 -rotate-3 rounded-lg bg-blossom-400 shadow-clay-sm" />
            <div className="absolute bottom-9 left-9 h-9 w-16 rotate-2 rounded-lg bg-sunny-400 shadow-clay-sm" />
            <div className="absolute bottom-16 left-8 h-9 w-16 -rotate-1 rounded-lg bg-teal-400 shadow-clay-sm" />
          </div>
        </div>

        <div className="mx-auto mb-8 hidden max-w-2xl text-center md:block xs:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sage-600 shadow-clay-sm">
            <GraduationCap className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
            Shop by Learning Goal
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            What do you want your child to <span className="text-blossom-600">learn?</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
            Browse by topic and find the perfect books and activities for
            their growing minds and hearts.
          </p>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {goals.map(({ title, description, href, icon: Icon, image, cardBg, iconBg, titleColor }) => (
            <li key={title} className="w-64 shrink-0 snap-start xs:w-72 sm:w-auto">
              <Link
                href={href}
                className={`group relative flex h-64 items-stretch gap-2 overflow-hidden rounded-3xl p-4 shadow-clay-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-clay xs:h-72 ${cardBg}`}
              >
                <div className="flex w-[55%] shrink-0 flex-col">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream-50 shadow-soft ${iconBg}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <h3 className={`mt-3 font-display text-base font-semibold leading-snug xs:text-lg ${titleColor}`}>
                    {title}
                  </h3>
                  <p className="mt-1 line-clamp-4 text-xs leading-snug text-ink-500 xs:text-sm">{description}</p>

                  <span className="tap-target mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-cream-50 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft transition-transform group-hover:translate-x-0.5">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>

                {image && (
                  <div className="relative -my-4 -mr-4 h-[calc(100%+2rem)] w-[45%] shrink-0">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(max-width: 480px) 45vw, 200px"
                      className="object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
