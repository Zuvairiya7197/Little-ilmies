"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { GooeySearch } from "@/components/store/gooey-search";

interface SearchResult {
  slug: string;
  title: string;
}

/** Wires GooeySearch to the real product search API and navigates to the
 * selected product. Results are rendered as "Title" strings (the widget's
 * item type), so we keep a slug lookup alongside (in a ref, so it survives
 * re-renders between the search call and the select click) to resolve on
 * select. */
export function HeaderGooeySearch() {
  const router = useRouter();
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
    if (match) router.push(`/product/${match.slug}`);
  }

  return (
    <GooeySearch
      onSearch={handleSearch}
      onSelect={handleSelect}
      placeholder="Search books..."
      buttonLabel="Search"
      debounceMs={350}
      maxResults={5}
    />
  );
}
