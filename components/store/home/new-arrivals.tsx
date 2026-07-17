import Link from "next/link";
import { ProductCarousel } from "@/components/store/home/product-carousel";
import { getNewArrivals } from "@/lib/catalog";
import type { ProductSummary } from "@/types/catalog";

export function NewArrivals({ products }: { products: ProductSummary[] }) {
  const newArrivals = getNewArrivals(products, 8);
  if (newArrivals.length === 0) return null;

  return (
    <section aria-labelledby="new-arrivals-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mb-5 flex items-end justify-between gap-4 xs:mb-6">
          <div>
            <p className="section-eyebrow">Just added</p>
            <h2 id="new-arrivals-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="hidden shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline md:block"
          >
            View all
          </Link>
        </div>

        <ProductCarousel products={newArrivals} />
      </div>
    </section>
  );
}
