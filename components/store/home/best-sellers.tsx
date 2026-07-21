import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { ProductCarousel } from "@/components/store/home/product-carousel";
import { getBestsellers } from "@/lib/catalog";
import type { ProductSummary } from "@/types/catalog";

export function BestSellers({ products }: { products: ProductSummary[] }) {
  const bestsellers = getBestsellers(products, 8);
  if (bestsellers.length === 0) return null;

  return (
    <section aria-labelledby="bestsellers-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 xs:mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sage-600 md:rounded-full md:bg-cream-50 md:px-3.5 md:py-1.5 md:shadow-clay-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blossom-50 md:hidden">
                <Star className="h-3.5 w-3.5 fill-blossom-400 text-blossom-400" aria-hidden="true" />
              </span>
              <Star className="hidden h-3.5 w-3.5 fill-blossom-400 text-blossom-400 md:block" aria-hidden="true" />
              Best Sellers
            </span>
            <h2 id="bestsellers-heading" className="mt-3 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
              What families are reading now
            </h2>
            <p className="mt-1.5 text-sm text-ink-400 xs:text-base">
              Loved by parents. Cherished by little hearts.
            </p>
          </div>
          <Link
            href="/shop?sort=bestselling"
            className="tap-target flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-600 md:rounded-full md:bg-cream-50 md:px-4 md:py-2.5 md:shadow-clay-sm md:transition-all md:duration-200 md:hover:-translate-y-0.5 md:hover:shadow-clay"
          >
            View all
            <span className="hidden md:inline">books</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ProductCarousel products={bestsellers} />
      </div>
    </section>
  );
}
