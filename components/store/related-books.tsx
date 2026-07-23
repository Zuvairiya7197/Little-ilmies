import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import type { ProductSummary } from "@/types/catalog";

export function RelatedBooks({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="scroll-mt-24">
      <div className="flex items-center justify-between">
        <h2 id="related-heading" className="font-display text-xl font-bold text-ink-700">
          You may also like
        </h2>
        <Link
          href="/shop"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid auto-rows-fr grid-cols-2 items-stretch gap-x-4 gap-y-8 sm:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} tintIndex={i} />
        ))}
      </div>
    </section>
  );
}
