import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCarousel } from "@/components/store/home/product-carousel";
import { getNewArrivals } from "@/lib/catalog";
import type { ProductSummary } from "@/types/catalog";

export function NewArrivals({ products }: { products: ProductSummary[] }) {
  const newArrivals = getNewArrivals(products, 8);
  if (newArrivals.length === 0) return null;

  return (
    <section aria-labelledby="new-arrivals-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mb-5 flex items-start justify-between gap-4 xs:mb-6">
          <div>
            <p className="section-eyebrow">Just added</p>
            <h2 id="new-arrivals-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
              New Arrivals
            </h2>
            <p className="mt-1.5 text-sm text-ink-400 xs:text-base">
              Fresh books and activities kids will love!
            </p>
          </div>
          <Link
            href="/shop?sort=newest"
            className="tap-target flex shrink-0 items-center gap-1.5 rounded-full bg-cream-50 px-4 py-2.5 text-sm font-semibold text-ink-600 shadow-clay-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay md:bg-transparent md:px-0 md:py-0 md:text-sage-700 md:no-underline md:shadow-none md:hover:translate-y-0 md:hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4 md:hidden" aria-hidden="true" />
          </Link>
        </div>

        <ProductCarousel products={newArrivals} showDots />
      </div>
    </section>
  );
}
