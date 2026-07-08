import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StarRating } from "@/components/store/star-rating";
import type { ProductDetail } from "@/types/catalog";

export function ProductHeader({ product }: { product: ProductDetail }) {
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink-300">
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

      <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
        {product.category.name}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink-700 xs:text-3xl">
        {product.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-400">
        <span className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="font-semibold text-ink-600">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount} reviews)</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>Ages {product.ageRange}</span>
        <span aria-hidden="true">·</span>
        <span>{product.pageCount} pages</span>
        <span aria-hidden="true">·</span>
        <span>{product.language}</span>
      </div>

      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-500">
        {product.shortDescription}
      </p>
    </div>
  );
}
