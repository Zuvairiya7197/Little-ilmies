import { BookOpen, Download, Smartphone, BookMarked, Palette, Sparkles, Check, ShieldCheck } from "lucide-react";
import type { ProductDetail } from "@/types/catalog";

const aboutTags = [
  { label: "Authentic Content", icon: BookMarked, tint: "bg-ink-50 text-ink-600" },
  { label: "Engaging Activities", icon: Palette, tint: "bg-blossom-50 text-blossom-600" },
  { label: "Beautiful Illustrations", icon: Sparkles, tint: "bg-sage-50 text-sage-700" },
] as const;

/** Mobile & tablet: condensed format row + About this book + Language/Author/Publisher,
 * matches app-style PDP design. Replaces the fuller desktop info sections
 * (Overview, What's Inside, Learning Benefits, File Details, Reviews). */
export function ProductMobileAbout({ product }: { product: ProductDetail }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-3 divide-x divide-ink-100 rounded-2xl border border-ink-100 bg-cream-50 px-2 py-4 shadow-soft sm:px-5">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <BookOpen className="h-5 w-5 shrink-0 text-ink-300 sm:h-7 sm:w-7" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink-600 sm:text-sm">Format</p>
            <p className="text-xs font-medium text-ink-700 sm:text-base">{product.format}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Download className="h-5 w-5 shrink-0 text-ink-300 sm:h-7 sm:w-7" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink-600 sm:text-sm">Download</p>
            <p className="text-xs font-medium text-ink-700 sm:text-base">Instant Access</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Smartphone className="h-5 w-5 shrink-0 text-ink-300 sm:h-7 sm:w-7" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink-600 sm:text-sm">Read on</p>
            <p className="text-xs font-medium text-ink-700 sm:text-base">Any Device</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-ink-700">About this book</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-500">{product.description}</p>

        <div className="mt-5 flex flex-wrap gap-5">
          {aboutTags.map(({ label, icon: Icon, tint }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold sm:px-4 sm:text-base ${tint}`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <HighlightList title="What's Included" items={product.whatsInside} />
        <HighlightList title="Learning Objectives" items={product.learningBenefits} />
        <div>
          <h2 className="font-display text-xl font-bold text-ink-700">Suitable For</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.bestFor.map((item) => (
              <span key={item} className="rounded-full bg-sage-50 px-3 py-1.5 text-xs font-semibold text-sage-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-cream-50 p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sage-700" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-ink-700">Usage License</h2>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-600">{licenseLabel(product.usageLicense)}</p>
        {product.licenseInfo && <p className="mt-2 text-sm leading-relaxed text-ink-500">{product.licenseInfo}</p>}
      </div>
    </div>
  );
}

function HighlightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-700">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink-500">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function licenseLabel(license: ProductDetail["usageLicense"]) {
  if (license === "PERSONAL_CLASSROOM") return "Personal + Classroom";
  if (license === "COMMERCIAL_USE") return "Commercial Use";
  return "Personal Use";
}
