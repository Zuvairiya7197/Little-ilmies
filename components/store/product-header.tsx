import Link from "next/link";
import { ChevronRight, User, FileText, Globe } from "lucide-react";
import { StarRating } from "@/components/store/star-rating";
import type { ProductDetail } from "@/types/catalog";

export function ProductHeader({ product }: { product: ProductDetail }) {
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 hidden items-center gap-1.5 text-xs text-ink-300 md:flex">
        <Link href="/shop" className="hover:text-ink-500">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link href={`/shop/${product.category.slug}`} className="hover:text-ink-500">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="truncate text-ink-400">{product.title}</span>
      </nav>

      {/* Mobile & tablet: plain category label + ages/pages line, matches app-style PDP design */}
      <div className="md:hidden">
        <Link
          href={`/shop/${product.category.slug}`}
          className="text-xs font-bold uppercase tracking-wide text-sage-600"
        >
          {product.category.name}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-ink-700">
          {product.title}
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Ages {product.ageRange} · {product.pageCount}pg
        </p>
        {product.reviewCount > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-sm text-ink-400">({product.reviewCount})</span>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <span className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sage-700">
          {product.category.name}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink-700 xs:text-4xl">
          {product.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {product.reviewCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-ink-600">
              <StarRating rating={product.rating} />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-ink-600">
            <User className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
            Ages {product.ageRange}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-ink-600">
            <FileText className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
            {product.pageCount} pages
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-ink-600">
            <Globe className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
            {product.language}
          </span>
        </div>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-500">
          {product.shortDescription}
        </p>
      </div>
    </div>
  );
}
