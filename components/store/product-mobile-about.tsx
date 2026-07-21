import { BookOpen, Download, Smartphone, Globe, User, ShoppingBag, BookMarked, Palette, Sparkles } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3 rounded-3xl bg-cream-50 p-4 shadow-clay-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-ink-300">Format</p>
            <p className="text-sm font-semibold text-ink-700">PDF</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-ink-300">Download</p>
            <p className="text-sm font-semibold text-ink-700">Instant Access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-ink-300">Read on</p>
            <p className="text-sm font-semibold text-ink-700">Any Device</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-ink-700">About this book</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {aboutTags.map(({ label, icon: Icon, tint }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${tint}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-ink-100 pt-5 xs:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-400 shadow-clay-sm">
              <Globe className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-ink-300">Language</p>
              <p className="text-sm font-semibold text-ink-700">{product.language}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-400 shadow-clay-sm">
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-ink-300">Author</p>
              <p className="text-sm font-semibold text-ink-700">Little Ilmies</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-400 shadow-clay-sm">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-ink-300">Publisher</p>
              <p className="text-sm font-semibold text-ink-700">Little Ilmies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
