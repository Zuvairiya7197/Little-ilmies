import { ProductCarousel } from "@/components/store/home/product-carousel";
import { getFeaturedProducts } from "@/lib/catalog";
import type { ProductSummary } from "@/types/catalog";

/** No personalization engine exists yet, so this falls back to featured
 * products — excluding ones already surfaced in Best Sellers / New Arrivals
 * above so the homepage doesn't repeat the same covers twice. */
export function RecommendedBooks({ products }: { products: ProductSummary[] }) {
  const alreadyShown = new Set(
    products.filter((p) => p.isBestseller || p.isNewArrival).map((p) => p.id)
  );
  const recommended = getFeaturedProducts(
    products.filter((p) => !alreadyShown.has(p.id)),
    8
  );
  if (recommended.length === 0) return null;

  return (
    <section aria-labelledby="recommended-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mb-5 xs:mb-6">
          <p className="section-eyebrow">Just for you</p>
          <h2 id="recommended-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Recommended For You
          </h2>
        </div>

        <ProductCarousel products={recommended} />
      </div>
    </section>
  );
}
