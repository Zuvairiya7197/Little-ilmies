import { BookOpen, ShieldCheck, MessageCircleHeart, Printer, Home, Zap } from "lucide-react";

const reasons = [
  {
    icon: BookOpen,
    title: "Based on Qur'an & authentic Sunnah",
    description: "Every story is rooted in reliable, well-referenced sources.",
  },
  {
    icon: ShieldCheck,
    title: "No unverified stories",
    description: "We avoid weak narrations and folklore often found elsewhere.",
  },
  {
    icon: MessageCircleHeart,
    title: "Child-friendly language",
    description: "Written and illustrated to genuinely hold a child's attention.",
  },
  {
    icon: Printer,
    title: "Printable digital PDFs",
    description: "Print at home as many times as your family needs.",
  },
  {
    icon: Home,
    title: "For home, madrasa & homeschooling",
    description: "Flexible enough for classrooms, weekend school, or bedtime.",
  },
  {
    icon: Zap,
    title: "Instant access after purchase",
    description: "No waiting — your e-books are ready to open right away.",
  },
];

export function WhyTrustSection() {
  return (
    <section aria-labelledby="why-trust-heading" className="py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Why parents trust us</p>
          <h2 id="why-trust-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Why Parents Trust Little Ilmies
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 xs:mt-10 xs:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card-surface flex gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink-600">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
