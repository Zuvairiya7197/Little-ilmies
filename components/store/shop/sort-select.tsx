"use client";

import { useShopFilters } from "@/hooks/use-shop-filters";
import { sortLabels } from "@/lib/catalog";
import type { SortOption } from "@/types/catalog";

const options: SortOption[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "bestselling",
  "alphabetical",
  "most-downloaded",
  "highest-rated",
];

export function SortSelect() {
  const { sort, setSort } = useShopFilters();

  return (
    <label className="tap-target flex items-center gap-2 rounded-full border border-ink-100 bg-cream-50 px-4 text-sm font-medium text-ink-600">
      <span className="hidden text-ink-300 xs:inline">Sort by</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortOption)}
        aria-label="Sort books"
        className="tap-target min-w-0 cursor-pointer appearance-none bg-transparent py-2 pr-1 text-sm font-semibold text-ink-600"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {sortLabels[opt]}
          </option>
        ))}
      </select>
    </label>
  );
}
