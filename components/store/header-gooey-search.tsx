"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { GooeySearch } from "@/components/store/gooey-search";

interface SearchResult {
  slug: string;
  title: string;
}

/** Wires GooeySearch to the real product search API and navigates to the
 * selected product. Renders as a plain icon button — matching the other
 * header icons (Wishlist, Cart) — that reveals the gooey input already
 * expanded on tap, rather than the widget's own capsule/pill trigger. */
export function HeaderGooeySearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const lastResultsRef = useRef<SearchResult[]>([]);

  async function handleSearch(query: string): Promise<string[]> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    lastResultsRef.current = data.results as SearchResult[];
    return lastResultsRef.current.map((r) => r.title);
  }

  function handleSelect(title: string) {
    const match = lastResultsRef.current.find((r) => r.title === title);
    if (match) {
      setOpen(false);
      router.push(`/product/${match.slug}`);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="tap-target flex items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <GooeySearch
        onSearch={handleSearch}
        onSelect={handleSelect}
        placeholder="Search books..."
        debounceMs={350}
        maxResults={5}
        startExpanded
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close search"
        className="tap-target flex items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
