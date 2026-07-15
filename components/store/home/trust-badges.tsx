import { BookOpenCheck, Download, Printer, Baby, ShieldCheck } from "lucide-react";

const badges = [
  { icon: BookOpenCheck, label: "Islamic & Educational Books" },
  { icon: Download, label: "Instant PDF Download" },
  { icon: Printer, label: "Printable at Home" },
  { icon: Baby, label: "Made for Kids" },
  { icon: ShieldCheck, label: "Secure Payment" },
];

export function TrustBadges() {
  return (
    <section aria-label="Why parents choose Little Ilmies" className="border-y border-ink-100 bg-cream-100">
      <div className="container-content">
        <ul className="grid grid-cols-2 gap-px xs:grid-cols-3 md:grid-cols-5">
          {badges.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className="flex flex-col items-center gap-2.5 px-3 py-6 text-center xs:py-7"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-sage-600 shadow-clay-sm animate-float-sm"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold leading-snug text-ink-500 xs:text-sm">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
