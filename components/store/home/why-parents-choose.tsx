import { BookOpenCheck, Download, Printer, Baby, BookOpen, ShieldCheck, Heart, CloudDownload } from "lucide-react";

const reasons = [
  { icon: BookOpenCheck, label: "Authentic Islamic Content", tint: "bg-ink-50 text-ink-600" },
  { icon: Download, label: "Instant Digital Download", tint: "bg-sunny-50 text-sunny-600" },
  { icon: Printer, label: "Printable PDF", tint: "bg-lemon-50 text-lemon-600" },
  { icon: Baby, label: "Kid Friendly", tint: "bg-teal-50 text-teal-600" },
  { icon: BookOpen, label: "Easy To Read", tint: "bg-blossom-50 text-blossom-600" },
  { icon: ShieldCheck, label: "Secure Checkout", tint: "bg-sage-50 text-sage-600" },
] as const;

const mobileReasons = [
  {
    icon: ShieldCheck,
    title: "Authentic Content",
    description: "Carefully curated Islamic resources",
    cardBg: "bg-ink-50",
    iconBg: "bg-ink-400",
  },
  {
    icon: CloudDownload,
    title: "Instant Download",
    description: "Get your books right away",
    cardBg: "bg-sunny-50",
    iconBg: "bg-sunny-400",
  },
  {
    icon: Printer,
    title: "Print at Home",
    description: "Easy to print and use",
    cardBg: "bg-teal-50",
    iconBg: "bg-teal-500",
  },
  {
    icon: Heart,
    title: "Loved by Parents",
    description: "Trusted by thousands of families",
    cardBg: "bg-blossom-50",
    iconBg: "bg-blossom-500",
  },
] as const;

export function WhyParentsChoose() {
  return (
    <section aria-label="Why parents choose Little Ilmies" className="border-y border-ink-100 bg-cream-100 py-8 xs:py-10">
      <div className="container-content">
        {/* Mobile & tablet: card grid with icon badge + title + description, matches app-style home design */}
        <div className="md:hidden">
          <h2 className="font-display text-2xl font-semibold text-ink-700">
            Why Parents Choose Little Ilmies
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {mobileReasons.map(({ icon: Icon, title, description, cardBg, iconBg }) => (
              <div key={title} className={`flex flex-col items-start gap-2.5 rounded-3xl p-4 ${cardBg}`}>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-cream-50 shadow-soft ${iconBg}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="font-display text-sm font-semibold leading-snug text-ink-700">{title}</p>
                <p className="text-xs leading-snug text-ink-400">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: compact icon row, unchanged */}
        <ul className="hidden md:grid md:grid-cols-6 md:gap-5">
          {reasons.map(({ icon: Icon, label, tint }) => (
            <li key={label} className="flex flex-col items-center gap-2 text-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-full shadow-clay-sm ${tint}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold leading-snug text-ink-500">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
