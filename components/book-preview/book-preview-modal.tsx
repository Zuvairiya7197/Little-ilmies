"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, X } from "lucide-react";

export function BookPreviewModal({
  open,
  onClose,
  title,
  previewImages,
  productSlug,
  pageCount,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  previewImages: string[];
  productSlug: string;
  pageCount: number;
}) {
  const [index, setIndex] = useState(0);
  const isLocked = index >= previewImages.length;
  const totalSlides = previewImages.length + 1;

  useEffect(() => {
    if (open) {
      setIndex(0);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(totalSlides - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, totalSlides]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${title}`}
          className="fixed inset-0 z-[100] flex flex-col bg-ink-700/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-4 py-4 xs:px-6">
            <p className="truncate pr-4 text-sm font-semibold text-cream-100">{title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="tap-target flex shrink-0 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 transition-colors hover:bg-cream-50/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6 xs:px-8">
            <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl bg-cream-50 shadow-lifted">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  {isLocked ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4 bg-ink-600 px-6 text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-50/10 text-cream-50">
                        <Lock className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <p className="font-display text-lg font-semibold text-cream-50">
                        Purchase to unlock the full PDF
                      </p>
                      <p className="text-sm text-cream-200">
                        You&apos;ve seen {previewImages.length} of {pageCount} pages
                      </p>
                      <Link href={`/product/${productSlug}#buy`} onClick={onClose} className="btn-accent mt-1">
                        Buy Now to Download Full E-Book
                      </Link>
                    </div>
                  ) : (
                    <Image
                      src={previewImages[index]}
                      alt={`Sample page ${index + 1} of ${title}`}
                      fill
                      sizes="(max-width: 480px) 90vw, 420px"
                      className="object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Previous page"
                className="tap-target absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/90 text-ink-600 shadow-soft disabled:opacity-0"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.min(totalSlides - 1, i + 1))}
                  aria-label="Next page"
                  className="tap-target absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/90 text-ink-600 shadow-soft"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <p className="pb-6 text-center text-xs font-medium text-cream-200">
            {isLocked ? "Preview ended" : `Sample page ${index + 1} of ${previewImages.length}`} · Full book is {pageCount} pages
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
