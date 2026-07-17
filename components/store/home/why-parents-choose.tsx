import { BookOpenCheck, Download, Printer, Baby, BookOpen, ShieldCheck } from "lucide-react";

const reasons = [
  { icon: BookOpenCheck, label: "Authentic Islamic Content", tint: "bg-ink-50 text-ink-600" },
  { icon: Download, label: "Instant Digital Download", tint: "bg-sunny-50 text-sunny-600" },
  { icon: Printer, label: "Printable PDF", tint: "bg-lemon-50 text-lemon-600" },
  { icon: Baby, label: "Kid Friendly", tint: "bg-teal-50 text-teal-600" },
  { icon: BookOpen, label: "Easy To Read", tint: "bg-blossom-50 text-blossom-600" },
  { icon: ShieldCheck, label: "Secure Checkout", tint: "bg-sage-50 text-sage-600" },
] as const;

export function WhyParentsChoose() {
  return (
    <section aria-label="Why parents choose Little Ilmies" className="border-y border-ink-100 bg-cream-100 py-8 xs:py-10">
      <div className="container-content">
        <ul className="grid grid-cols-3 gap-4 xs:gap-5 md:grid-cols-6">
          {reasons.map(({ icon: Icon, label, tint }) => (
            <li key={label} className="flex flex-col items-center gap-2 text-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-full shadow-clay-sm ${tint}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-semibold leading-snug text-ink-500 xs:text-xs">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
