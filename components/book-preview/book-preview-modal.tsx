"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InteractiveBook } from "@/components/book-preview/interactive-book";

export function BookPreviewModal({
  open,
  onClose,
  title,
  coverImage,
  previewImages,
  productSlug,
  pageCount,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  coverImage: string;
  previewImages: string[];
  productSlug: string;
  pageCount: number;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${title}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-700/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="max-w-full origin-center scale-[0.62] xs:scale-75 sm:scale-100">
            <InteractiveBook
              coverImage={coverImage}
              bookTitle={title}
              previewImages={previewImages}
              productSlug={productSlug}
              pageCount={pageCount}
              onClose={onClose}
              width={380}
              height={520}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
