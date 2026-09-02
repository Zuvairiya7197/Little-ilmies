"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const BOOK_OPEN_DURATION = 1.1;
const EASING: [number, number, number, number] = [0.25, 0, 0, 1];

export function InteractiveBook({
  coverImage,
  bookTitle,
  previewImages,
  productSlug,
  pageCount,
  onClose,
  className,
  openOnMount = false,
  width = 380,
  height = 520,
}: {
  coverImage: string;
  bookTitle: string;
  previewImages: string[];
  productSlug: string;
  pageCount: number;
  onClose: () => void;
  className?: string;
  openOnMount?: boolean;
  width?: number;
  height?: number;
}) {
  const [isOpen, setIsOpen] = useState(openOnMount);
  // -1 = cover closed/open with no page turned yet; index into previewImages,
  // or previewImages.length for the locked "buy to unlock" page.
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [isHovering, setIsHovering] = useState(false);

  const previewCoverImage = previewImages[0] ?? coverImage;
  const hasTurnedPage = currentPageIndex >= 0;
  const contentLeafCount = Math.ceil(previewImages.length / 2);
  const totalLeaves = contentLeafCount + 1; // + the locked page

  const handleOpenBook = () => setIsOpen(true);

  const nextPage = () => {
    if (currentPageIndex < totalLeaves - 1) setCurrentPageIndex((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPageIndex >= 0) setCurrentPageIndex((prev) => prev - 1);
  };

  const restartBook = () => {
    setIsOpen(true);
    setCurrentPageIndex(-1);
  };

  useEffect(() => {
    setIsOpen(openOnMount);
    setCurrentPageIndex(-1);
    setIsHovering(false);
  }, [openOnMount, previewImages]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPageIndex]);

  // The book spans two leaf-widths once open (left page + right page), so
  // the whole spread stays centered instead of only the right half showing.
  const spreadWidth = width * 2;

  return (
    <div
      className={cn("relative flex items-center justify-center perspective-[2400px]", className)}
      style={{ width: spreadWidth + 120, height: height + 90 }}
    >
      <motion.div
        className="preserve-3d relative"
        style={{ width, height }}
        initial={{ x: 0 }}
        animate={{ x: hasTurnedPage ? width / 2 : 0 }}
        transition={{ duration: BOOK_OPEN_DURATION, ease: EASING }}
      >
        {/* Front cover */}
        <motion.div
          className="absolute inset-0 h-full w-full origin-left"
          initial={{ rotateY: 0, zIndex: 100 }}
          animate={{
            rotateY: isOpen ? -180 : isHovering ? -12 : 0,
            zIndex: isOpen ? 0 : 100,
          }}
          transition={{
            rotateY: { duration: BOOK_OPEN_DURATION, ease: EASING },
            zIndex: { delay: isOpen ? BOOK_OPEN_DURATION * 0.6 : BOOK_OPEN_DURATION * 0.4 },
          }}
          style={{ transformStyle: "preserve-3d" }}
          onClick={!isOpen ? handleOpenBook : undefined}
          onHoverStart={() => !isOpen && setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          <div
            className="backface-hidden group absolute inset-0 h-full w-full cursor-pointer overflow-hidden rounded-l-sm rounded-r-md shadow-2xl"
            style={{ transform: "translateZ(0.5px)" }}
          >
            <Image
              src={previewCoverImage}
              alt={`${bookTitle} preview cover`}
              fill
              sizes="(max-width: 480px) 90vw, 520px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-r from-white/30 to-transparent opacity-40" aria-hidden="true" />
          </div>

          <div
            className={cn(
              "backface-hidden rotate-y-180 absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center border-r border-ink-100 bg-cream-50 p-8 text-center shadow-xl transition-colors hover:bg-cream-100",
              !hasTurnedPage && "pointer-events-none opacity-0",
            )}
            style={{ transform: "rotateY(180deg) translateZ(0.5px)" }}
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
          >
            <h2 className="font-display text-xl font-semibold tracking-wide text-ink-700">{bookTitle}</h2>
            <span className="mt-3 h-px w-8 bg-ink-200" aria-hidden="true" />
            <p className="mt-3 text-xs uppercase tracking-widest text-ink-300">Sample Preview</p>
          </div>
        </motion.div>

        {/* Page stack — turned leaves rest flat to the left, showing their back */}
        <div className="preserve-3d absolute inset-0 z-0 h-full w-full">
          {Array.from({ length: contentLeafCount }).map((_, index) => {
            const rightImage = previewImages[index * 2];
            const leftImage = previewImages[index * 2 + 1];
            const isFlipped = index <= currentPageIndex;
            return (
              <motion.div
                key={`${rightImage}-${leftImage ?? "blank"}`}
                className="preserve-3d absolute inset-0 h-full w-full origin-left rounded-l-sm rounded-r-md border border-ink-100 bg-cream-50 shadow-sm"
                initial={{ rotateY: 0, zIndex: contentLeafCount - index }}
                animate={{
                  rotateY: isFlipped ? -180 : 0,
                  zIndex: isFlipped ? index + 1 : contentLeafCount - index,
                }}
                transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1] }}
              >
                <button
                  type="button"
                  aria-label={`Sample page ${index * 2 + 1}, go to next page`}
                  className="backface-hidden relative h-full w-full cursor-pointer overflow-hidden bg-cream-50 transition-colors hover:brightness-95"
                  style={{ transform: "translateZ(0.5px)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPage();
                  }}
                >
                  <Image
                    src={rightImage}
                    alt={`Sample page ${index * 2 + 1} of ${bookTitle}`}
                    fill
                    sizes="520px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink-700/70 px-2.5 py-1 text-[11px] font-medium text-cream-50">
                    Sample Page {index * 2 + 1}
                  </span>
                </button>

                {leftImage ? (
                  <button
                    type="button"
                    aria-label={`Sample page ${index * 2 + 2}, go to previous page`}
                    className="backface-hidden rotate-y-180 absolute inset-0 h-full w-full cursor-pointer overflow-hidden border-r border-ink-100 bg-cream-50 transition-colors hover:brightness-95"
                    style={{ transform: "rotateY(180deg) translateZ(0.5px)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPage();
                    }}
                  >
                    <Image
                      src={leftImage}
                      alt={`Sample page ${index * 2 + 2} of ${bookTitle}`}
                      fill
                      sizes="520px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink-700/70 px-2.5 py-1 text-[11px] font-medium text-cream-50">
                      Sample Page {index * 2 + 2}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Go to previous page"
                    className="backface-hidden rotate-y-180 absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center border-r border-ink-100 bg-cream-100 p-6 text-center transition-colors hover:bg-cream-200"
                    style={{ transform: "rotateY(180deg) translateZ(0.5px)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPage();
                    }}
                  >
                    <p className="text-xs uppercase tracking-widest text-ink-300">{bookTitle}</p>
                    <p className="mt-2 text-[11px] text-ink-300">End of sample pages</p>
                  </button>
                )}
              </motion.div>
            );
          })}

          {/* Locked final leaf — reuses the existing purchase-gate copy */}
          <motion.div
            key="locked-page"
            className="preserve-3d absolute inset-0 h-full w-full origin-left rounded-l-sm rounded-r-md border border-ink-100 shadow-sm"
            initial={{ rotateY: 0, zIndex: 0 }}
            animate={{
              rotateY: currentPageIndex >= contentLeafCount ? -180 : 0,
              zIndex: currentPageIndex >= contentLeafCount ? contentLeafCount + 1 : 0,
            }}
            transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1] }}
          >
            <div
              className="backface-hidden flex h-full w-full flex-col items-center justify-center gap-3 bg-ink-600 px-6 text-center"
              style={{ transform: "translateZ(0.5px)" }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-50/10 text-cream-50">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="font-display text-base font-semibold text-cream-50">
                Purchase to unlock the full PDF
              </p>
              <p className="text-xs text-cream-200">
                You&apos;ve seen {previewImages.length} of {pageCount} pages
              </p>
              <Link href={`/product/${productSlug}#buy`} onClick={onClose} className="btn-accent mt-1">
                Buy Now to Download
              </Link>
            </div>
            <div
              className="backface-hidden rotate-y-180 absolute inset-0 h-full w-full border-r border-ink-100 bg-cream-100"
              style={{ transform: "rotateY(180deg) translateZ(0.5px)" }}
            />
          </motion.div>

          {/* Back cover */}
          <div
            className="absolute inset-0 h-full w-full rounded-l-sm rounded-r-md border border-ink-100 bg-cream-50 shadow-xl"
            style={{ transform: "translateZ(-1px)", zIndex: -1 }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center opacity-60">
              <p className="font-display italic text-ink-400">The End</p>
              <button
                type="button"
                onClick={restartBook}
                className="tap-target flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-sm text-ink-500 transition-colors hover:bg-cream-200"
              >
                <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Read Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            aria-label="Close preview"
            className="absolute right-2 top-2 z-[1000] flex items-center justify-center rounded-full bg-cream-50/90 p-2 text-ink-600 shadow-soft backdrop-blur transition-transform hover:scale-110 xs:right-4 xs:top-4"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute bottom-2 cursor-pointer text-xs font-semibold uppercase tracking-widest text-ink-400 transition-colors hover:text-ink-600"
          onClick={handleOpenBook}
        >
          Click to Open
        </motion.p>
      )}
    </div>
  );
}
