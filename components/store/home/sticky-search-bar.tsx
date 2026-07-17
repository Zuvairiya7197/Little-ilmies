"use client";

import { Search } from "lucide-react";
import { useSearchStore } from "@/lib/store/use-search-store";

/** Large, tappable search entry point that sits right below the hero. Sticks
 * to the top of the viewport once scrolled past, giving Amazon/Flipkart-style
 * always-available search. Opens the same global SearchOverlay the header uses. */
export function StickySearchBar() {
  const openSearch = useSearchStore((s) => s.openSearch);

  return (
    <div className="sticky top-0 z-30 border-t border-ink-100 bg-cream-50/95 py-4 backdrop-blur xs:py-5">
      <div className="container-content">
        <button
          type="button"
          onClick={openSearch}
          className="store-input tap-target flex w-full items-center gap-3 rounded-full text-left"
        >
          <Search className="h-5 w-5 shrink-0 text-ink-300" aria-hidden="true" />
          <span className="truncate text-sm text-ink-300 xs:text-base">
            Search by title, topic, or category...
          </span>
        </button>
      </div>
    </div>
  );
}
