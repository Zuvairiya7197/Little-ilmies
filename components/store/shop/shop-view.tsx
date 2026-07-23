"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Star, ArrowRight, Download, Printer, Baby, ShieldCheck } from "lucide-react";
import { FilterSidebar } from "@/components/store/shop/filter-sidebar";
import { FilterDrawer } from "@/components/store/shop/filter-drawer";
import { ShopToolbar } from "@/components/store/shop/shop-toolbar";
import { ProductGrid } from "@/components/store/shop/product-grid";
import { ProductRow } from "@/components/store/shop/product-row";
import { SortSelect } from "@/components/store/shop/sort-select";
import { useShopFilters } from "@/hooks/use-shop-filters";
import { filterProducts, sortProducts } from "@/lib/catalog";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { cn } from "@/lib/utils/cn";
import type { Category, ProductSummary } from "@/types/catalog";

const ACTIVITY_CATEGORY_SLUGS = ["creative-learning", "printables", "games-and-activities"];

const typeFilters = ["All", "Books", "Activities", "Bundles"] as const;
type TypeFilter = (typeof typeFilters)[number];

const mobileTrustBadges = [
  { label: "Instant Download", description: "Start reading right away", icon: Download, iconBg: "bg-ink-50", iconColor: "text-ink-500" },
  { label: "Printable at Home", description: "Easy to print & use", icon: Printer, iconBg: "bg-sage-50", iconColor: "text-sage-600" },
  { label: "Kid Friendly", description: "Safe & suitable for all ages", icon: Baby, iconBg: "bg-teal-50", iconColor: "text-teal-600" },
  { label: "Secure Checkout", description: "100% safe & trusted", icon: ShieldCheck, iconBg: "bg-sunny-50", iconColor: "text-sunny-600" },
] as const;

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
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const { filters, sort, setQuery } = useShopFilters();
  const currency = useCurrencyStore((s) => s.currency);

  const results = useMemo(() => {
    const filtered = filterProducts(products, filters, currency);
    return sortProducts(filtered, sort, currency);
  }, [products, filters, sort, currency]);

  const mobileResults = useMemo(() => {
    if (typeFilter === "Activities") {
      return results.filter((p) => ACTIVITY_CATEGORY_SLUGS.includes(p.category.slug));
    }
    if (typeFilter === "Books") {
      return results.filter((p) => !ACTIVITY_CATEGORY_SLUGS.includes(p.category.slug));
    }
    return results;
  }, [results, typeFilter]);

  const isBestselling = sort === "bestselling";

  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <div className="relative mb-6 overflow-hidden xs:mb-8 md:block">
        {isBestselling ? (
          <div className="md:hidden">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blossom-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blossom-50">
                  <Star className="h-3.5 w-3.5 fill-blossom-400 text-blossom-400" aria-hidden="true" />
                </span>
                Best Sellers
              </span>
              <Link
                href="/shop?sort=bestselling"
                className="tap-target flex shrink-0 items-center gap-1.5 rounded-full bg-cream-50 px-4 py-2.5 text-sm font-semibold text-ink-600 shadow-clay-sm"
              >
                View all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink-700">
              What families are reading now
            </h1>
            <p className="mt-2 text-sm text-ink-400">Loved by parents. Cherished by little hearts.</p>
          </div>
        ) : (
          <div className="md:hidden">
            <h1 className="inline-flex items-center gap-2 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
              {title}
              <Sparkles className="h-6 w-6 text-lemon-400" aria-hidden="true" />
            </h1>
            {description && (
              <p className="mt-2 max-w-xl text-sm text-ink-400 xs:text-base">{description}</p>
            )}
          </div>
        )}

        <div className="hidden md:block">
          <h1 className="inline-flex items-center gap-2 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
            {title}
            <Sparkles className="h-6 w-6 text-lemon-400" aria-hidden="true" />
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-sm text-ink-400 xs:text-base">{description}</p>
          )}
        </div>
      </div>

      {/* Mobile & tablet: segmented type filter + sort + horizontal-row list, matches app-style "View all" design */}
      <div className="md:hidden">
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-cream-100 p-1 no-scrollbar">
          {typeFilters.map((option) =>
            option === "Bundles" ? (
              <Link
                key={option}
                href="/shop?bundle=all"
                className="tap-target shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-ink-500"
              >
                {option}
              </Link>
            ) : (
              <button
                key={option}
                type="button"
                onClick={() => setTypeFilter(option)}
                className={cn(
                  "tap-target shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  typeFilter === option ? "bg-ink-600 text-cream-50" : "text-ink-500"
                )}
              >
                {option}
              </button>
            )
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <SortSelect />
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {mobileResults.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2 rounded-3xl bg-cream-50 p-4 shadow-lifted xs:gap-3 xs:p-5">
          {mobileTrustBadges.map(({ label, description: badgeDescription, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="flex flex-col items-start gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full xs:h-9 xs:w-9 ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight text-ink-600 xs:text-xs">{label}</p>
                <p className="mt-0.5 hidden text-[10px] leading-tight text-ink-300 xs:block">{badgeDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: search bar + sidebar filters + grid, unchanged */}
      <div className="relative mb-6 hidden md:block">
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

      <div className="hidden md:flex md:items-start md:gap-8">
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
