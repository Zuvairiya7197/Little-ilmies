"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchResult {
  slug: string;
  title: string;
}

/** Expanding header search — matches the plain-icon look of the other header
 * actions (Wishlist, Cart) in both states: a transparent circular icon button
 * collapsed, and the same transparent/ink styling once expanded, rather than
 * a separately-styled widget. Closes on outside click, Escape, or selecting
 * a result. */
export function HeaderGooeySearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setResults(data.results as SearchResult[]);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  function handleSelect(slug: string) {
    close();
    router.push(`/product/${slug}`);
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {open && (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books..."
          aria-label="Search books"
          className="tap-target w-32 min-w-0 bg-transparent text-sm text-ink-600 placeholder:text-ink-300 focus:outline-none xs:w-44"
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search"
        className="tap-target flex shrink-0 items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Search results"
          className="absolute right-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-2xl bg-cream-50 py-1.5 shadow-clay"
        >
          {results.map((result) => (
            <li key={result.slug}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(result.slug)}
                className="tap-target flex w-full items-center px-4 py-2.5 text-left text-sm text-ink-600 hover:bg-ink-50"
              >
                {result.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
