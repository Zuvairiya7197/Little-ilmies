"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FilterPanel } from "@/components/store/shop/filter-panel";
import { useShopFilters } from "@/hooks/use-shop-filters";

export function FilterDrawer({
  open,
  onClose,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
}) {
  const { clearAll } = useShopFilters();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink-500/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Filter books"
            className="fixed inset-y-0 left-0 z-[90] flex w-[88%] max-w-sm flex-col bg-cream-50 shadow-lifted md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <span className="font-display text-lg font-semibold text-ink-600">
                Filters
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="tap-target flex items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel showHeading={false} />
            </div>

            <div className="safe-bottom flex gap-3 border-t border-ink-100 p-5">
              <button type="button" onClick={clearAll} className="btn-secondary flex-1">
                Clear
              </button>
              <button type="button" onClick={onClose} className="btn-primary flex-1">
                Show {resultCount} {resultCount === 1 ? "book" : "books"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
