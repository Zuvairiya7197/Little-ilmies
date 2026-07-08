import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { getBestsellers, getNewArrivals } from "@/data/products";

export function BestsellersSection() {
  const bestsellers = getBestsellers(6);
  const newArrivals = getNewArrivals(6);

  return (
    <section aria-labelledby="bestsellers-heading" className="py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="mb-6 xs:mb-8">
          <p className="section-eyebrow">Bestsellers &amp; new arrivals</p>
          <h2 id="bestsellers-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            What families are reading now
          </h2>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-6">
          {bestsellers.map((product) => (
            <div key={product.id} className="w-[45vw] shrink-0 snap-start xs:w-[38vw] sm:w-[30vw] md:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-10 mb-6 xs:mb-8">
          <p className="section-eyebrow">Just added</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            New Arrivals
          </h2>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-6">
          {newArrivals.map((product) => (
            <div key={product.id} className="w-[45vw] shrink-0 snap-start xs:w-[38vw] sm:w-[30vw] md:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop" className="btn-secondary">
            Explore All Books
          </Link>
        </div>
      </div>
    </section>
  );
}
