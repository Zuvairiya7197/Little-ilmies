"use client";

import Link from "next/link";
import { SearchX, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useShopFilters } from "@/hooks/use-shop-filters";
import type { ProductSummary } from "@/types/catalog";

/** No filters applied and still nothing to show means this category/page
 * itself has no books yet, not that the visitor filtered too narrowly —
 * those deserve different messaging (and a "Clear filters" action makes no
 * sense when there's nothing to clear). Shared by the desktop ProductGrid
 * below and ShopView's separate mobile results list. */
export function NoProductsMessage() {
  const { clearAll, activeFilterCount } = useShopFilters();

  if (activeFilterCount === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="New adventures on the way!"
        description="We're busy adding books here — check back soon, or explore our other collections in the meantime."
        action={
          <Link href="/shop" className="btn-secondary">
            Browse all books
          </Link>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={SearchX}
      title="No books found"
      description="Try adjusting your filters or search terms to find what you're looking for."
      action={
        <button type="button" onClick={clearAll} className="btn-secondary">
          Clear filters
        </button>
      }
    />
  );
}

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return <NoProductsMessage />;

  return (
    <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} tintIndex={i} />
      ))}
    </div>
  );
}
