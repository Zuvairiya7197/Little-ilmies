import Link from "next/link";
import { Heart, BookOpen, HandHeart, Landmark, Languages, Sparkles, Moon, ChevronRight, Star } from "lucide-react";

const goals = [
  {
    label: "Learn About Allah",
    description: "Building love and understanding of Allah.",
    href: "/shop/dua-and-prayers-for-kids",
    icon: Heart,
    cardBg: "bg-ink-50",
    iconBg: "bg-ink-100",
    iconColor: "text-ink-600",
    titleColor: "text-ink-700",
  },
  {
    label: "Stories of the Prophets",
    description: "Inspiring stories from our beloved prophets.",
    href: "/shop/stories-of-the-prophets",
    icon: BookOpen,
    cardBg: "bg-sunny-50",
    iconBg: "bg-sunny-200",
    iconColor: "text-sunny-800",
    titleColor: "text-sunny-800",
  },
  {
    label: "Good Manners",
    description: "Building beautiful habits for a better tomorrow.",
    href: "/shop/islamic-manners-and-character",
    icon: HandHeart,
    cardBg: "bg-sage-50",
    iconBg: "bg-sage-100",
    iconColor: "text-sage-700",
    titleColor: "text-sage-800",
  },
  {
    label: "Daily Duas",
    description: "Duas for everyday moments and success.",
    href: "/shop/dua-and-prayers-for-kids",
    icon: Landmark,
    cardBg: "bg-teal-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-700",
    titleColor: "text-ink-700",
  },
  {
    label: "Arabic Learning",
    description: "First steps to reading and loving Arabic.",
    href: "/shop/arabic-for-kids",
    icon: Languages,
    cardBg: "bg-blossom-50",
    iconBg: "bg-blossom-200",
    iconColor: "text-blossom-700",
    titleColor: "text-blossom-700",
  },
  {
    label: "Islamic Activities",
    description: "Fun activities that make Islamic learning joyful.",
    href: "/shop/kids-islamic-activity-books",
    icon: Sparkles,
    cardBg: "bg-sage-50",
    iconBg: "bg-sage-100",
    iconColor: "text-sage-700",
    titleColor: "text-sage-800",
  },
  {
    label: "Ramadan Learning",
    description: "Prepare, learn and grow in the blessed month.",
    href: "/shop/dua-and-prayers-for-kids",
    icon: Moon,
    cardBg: "bg-ink-50",
    iconBg: "bg-ink-100",
    iconColor: "text-ink-600",
    titleColor: "text-ink-700",
  },
] as const;

export function ShopByLearningGoal() {
  return (
    <section aria-labelledby="learning-goal-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mx-auto mb-8 max-w-xl text-center xs:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sage-600 shadow-clay-sm">
            <Star className="h-3.5 w-3.5 fill-lemon-400 text-lemon-400" aria-hidden="true" />
            Guided by Learning Goals
          </span>
          <h2 id="learning-goal-heading" className="mt-3 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            What do you want your child to <span className="text-ink-400">learn?</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
            Choose a topic and explore books &amp; activities that make
            learning meaningful.
          </p>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {goals.map(({ label, description, href, icon: Icon, cardBg, iconBg, iconColor, titleColor }) => (
            <li key={label} className="w-64 shrink-0 snap-start xs:w-72 sm:w-auto">
              <Link
                href={href}
                className={`tap-target group flex h-full items-center gap-3 rounded-2xl p-4 shadow-clay-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-clay ${cardBg}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-display text-sm font-semibold leading-snug xs:text-base ${titleColor}`}>
                    {label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-400">{description}</p>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-soft transition-transform group-hover:translate-x-0.5">
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
