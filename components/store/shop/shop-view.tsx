"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { FilterSidebar } from "@/components/store/shop/filter-sidebar";
import { FilterDrawer } from "@/components/store/shop/filter-drawer";
import { ShopToolbar } from "@/components/store/shop/shop-toolbar";
import { ProductGrid } from "@/components/store/shop/product-grid";
import { useShopFilters } from "@/hooks/use-shop-filters";
import { filterProducts, sortProducts } from "@/lib/catalog";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import type { Category, ProductSummary } from "@/types/catalog";

export function ShopView({
  products,
  categories,
  title,
  description,
  hideCategoryFilter,
}: {
  products: ProductSummary[];
  categories: Category[];
  title: string;
  description?: string;
  hideCategoryFilter?: boolean;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { filters, sort, setQuery } = useShopFilters();
  const currency = useCurrencyStore((s) => s.currency);

  const results = useMemo(() => {
    const filtered = filterProducts(products, filters, currency);
    return sortProducts(filtered, sort, currency);
  }, [products, filters, sort, currency]);

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <div className="relative mb-6 overflow-hidden xs:mb-8">
        <h1 className="inline-flex items-center gap-2 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
          {title}
          <Sparkles className="h-6 w-6 text-lemon-400" aria-hidden="true" />
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-ink-400 xs:text-base">{description}</p>
        )}
      </div>

      <div className="relative mb-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
          aria-hidden="true"
        />
        <label htmlFor="shop-search" className="sr-only">
          Search books
        </label>
        <input
          id="shop-search"
          type="search"
          defaultValue={filters.query ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, category, or language..."
          className="tap-target w-full rounded-full border-0 bg-cream-50 py-3.5 pl-12 pr-4 text-sm text-ink-600 placeholder:text-ink-300 shadow-clay transition-shadow focus-visible:shadow-clay-pressed"
        />
      </div>

      <div className="md:flex md:items-start md:gap-8">
        {!hideCategoryFilter && <FilterSidebar categories={categories} />}

        <div className="min-w-0 flex-1">
          <ShopToolbar resultCount={results.length} onOpenFilters={() => setFiltersOpen(true)} />
          <div className="pt-6">
            <ProductGrid products={results} />
          </div>
        </div>
      </div>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={results.length}
        categories={categories}
      />
    </div>
  );
}
