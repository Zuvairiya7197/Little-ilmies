import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { learningGoals } from "@/lib/learning-goals";

export function ShopByLearningGoal() {
  return (
    <section aria-labelledby="learning-goal-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mx-auto mb-8 max-w-2xl text-center xs:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sage-600 shadow-clay-sm">
            <GraduationCap className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
            Shop by Learning Goal
          </span>
          <h2 id="learning-goal-heading" className="mt-3 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            What do you want your child to <span className="text-blossom-600">learn?</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
            Browse by topic and find the perfect books and activities for
            their growing minds and hearts.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {learningGoals.map(({ slug, label, description, imageAlt, icon: Icon, image, cardBg, iconBg, titleColor }) => (
            <li key={slug}>
              <Link
                href={`/shop/goal/${slug}`}
                className={`group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-clay-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-clay motion-reduce:transition-none motion-reduce:hover:translate-y-0 xs:min-h-[220px] xs:p-6 ${cardBg}`}
              >
                <div className="relative z-10 max-w-[65%]">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream-50 shadow-soft ${iconBg}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <h3 className={`mt-3 font-display text-base font-semibold leading-snug xs:text-lg ${titleColor}`}>
                    {label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500 xs:text-sm">{description}</p>
                </div>

                <span className="tap-target relative z-10 mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-cream-50 px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-soft transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>

                <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 xs:h-36 xs:w-36">
                  <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 480px) 40vw, 160px"
                    className="object-contain object-right-bottom"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
