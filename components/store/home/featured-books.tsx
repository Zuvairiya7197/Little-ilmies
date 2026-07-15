import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { getFeaturedProducts } from "@/lib/catalog";
import type { ProductSummary } from "@/types/catalog";

export function FeaturedBooks({ products }: { products: ProductSummary[] }) {
  const books = getFeaturedProducts(products, 8);

  return (
    <section aria-labelledby="featured-heading" className="bg-beige-light py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="mb-6 flex items-end justify-between gap-4 xs:mb-8">
          <div>
            <p className="section-eyebrow">Featured books</p>
            <h2 id="featured-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
              Loved by little readers
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline md:block"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/shop" className="btn-secondary">
            View all books
          </Link>
        </div>
      </div>
    </section>
  );
}
