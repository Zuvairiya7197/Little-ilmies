import { ProductCard } from "@/components/store/product-card";
import type { ProductSummary } from "@/types/catalog";

export function RelatedBooks({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="scroll-mt-24">
      <h2 id="related-heading" className="font-display text-xl font-semibold text-ink-700">
        Related Books
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
