"use client";

import { SlidersHorizontal, BookOpen } from "lucide-react";
import { SortSelect } from "@/components/store/shop/sort-select";
import { useShopFilters } from "@/hooks/use-shop-filters";
import { IconBadge } from "@/components/store/icon-badge";

export function ShopToolbar({
  resultCount,
  onOpenFilters,
}: {
  resultCount: number;
  onOpenFilters: () => void;
}) {
  const { activeFilterCount } = useShopFilters();

  return (
    <div className="sticky top-[105px] z-30 -mx-4 flex items-center justify-between gap-3 border-b border-ink-100 bg-cream-50/95 px-4 py-3 backdrop-blur xs:top-[113px] xs:-mx-5 xs:px-5 md:static md:mx-0 md:border-none md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          className="chip relative px-4 py-2 font-semibold md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="relative">
              <IconBadge count={activeFilterCount} />
            </span>
          )}
        </button>
        <p className="flex items-center gap-1.5 text-sm text-ink-500">
          <BookOpen className="h-4 w-4 text-ink-400" aria-hidden="true" />
          <span className="font-semibold text-ink-700">{resultCount}</span>{" "}
          {resultCount === 1 ? "book" : "books"}
        </p>
      </div>

      <SortSelect />
    </div>
  );
}
