"use client";

import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useShopFilters } from "@/hooks/use-shop-filters";
import type { ProductSummary } from "@/types/catalog";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  const { clearAll } = useShopFilters();

  if (products.length === 0) {
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

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} tintIndex={i} />
      ))}
    </div>
  );
}
