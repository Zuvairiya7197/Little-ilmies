"use client";

import { ChevronDown } from "lucide-react";
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
    <label className="tap-target inline-flex items-center gap-1.5 text-sm text-ink-400">
      <span className="hidden xs:inline">Sort by</span>
      <span className="relative inline-flex items-center">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort books"
          className="cursor-pointer appearance-none bg-transparent py-2 pl-0 pr-5 text-sm font-semibold text-ink-700 focus-visible:outline-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {sortLabels[opt]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
      </span>
    </label>
  );
}
