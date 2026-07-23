"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

const popularSearches = [
  "Stories of the Prophets",
  "Du'ā' for kids",
  "Arabic for Kids",
  "Coloring books",
  "Preschool learning",
];

interface SearchResult {
  slug: string;
  title: string;
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setIsSearching(false);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setResults(data.results as SearchResult[]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function goToSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  }

  function goToProduct(slug: string) {
    onClose();
    router.push(`/product/${slug}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search books"
          className="fixed inset-0 z-[70] flex flex-col bg-cream-50 md:items-start md:justify-start md:bg-ink-500/40 md:backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="w-full bg-cream-50 md:mt-0 md:max-w-2xl md:rounded-b-3xl md:shadow-lifted"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-4 xs:px-5">
              <Search className="h-5 w-5 shrink-0 text-ink-300" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToSearch();
                }}
                placeholder="Search books, categories, keywords..."
                aria-label="Search books, categories, or keywords"
                className="tap-target min-w-0 flex-1 bg-transparent font-sans text-base text-ink-600 placeholder:text-ink-300"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="tap-target -mr-2 flex items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-4 py-6 xs:px-5">
              {query.trim().length >= 2 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="section-eyebrow">Results</p>
                    <button
                      type="button"
                      onClick={goToSearch}
                      className="text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
                    >
                      Search all
                    </button>
                  </div>

                  {isSearching ? (
                    <p className="text-sm text-ink-300">Searching...</p>
                  ) : results.length > 0 ? (
                    <ul className="overflow-hidden rounded-2xl border border-ink-100">
                      {results.map((result) => (
                        <li key={result.slug} className="border-b border-ink-100 last:border-b-0">
                          <button
                            type="button"
                            onClick={() => goToProduct(result.slug)}
                            className="tap-target flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-ink-600 transition-colors hover:bg-cream-100"
                          >
                            <Search className="h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />
                            {result.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-300">No books found. Try another search.</p>
                  )}
                </div>
              )}

              <p className="section-eyebrow mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="chip px-4 py-2"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
