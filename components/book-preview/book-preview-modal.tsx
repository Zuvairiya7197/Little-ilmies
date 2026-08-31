"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { InteractiveBook } from "@/components/book-preview/interactive-book";

const BOOK_WIDTH = 380;
const BOOK_HEIGHT = 520;
const BOOK_STAGE_WIDTH = BOOK_WIDTH * 2 + 120;
const BOOK_STAGE_HEIGHT = BOOK_HEIGHT + 90;
const MODAL_PADDING = 32;

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
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function updateScale() {
      const availableWidth = Math.max(280, window.innerWidth - MODAL_PADDING);
      const availableHeight = Math.max(320, window.innerHeight - MODAL_PADDING);
      setScale(Math.min(availableWidth / BOOK_STAGE_WIDTH, availableHeight / BOOK_STAGE_HEIGHT, 1));
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, [open]);

  const modal = (
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
          <div
            className="origin-center"
            style={{
              width: BOOK_STAGE_WIDTH,
              height: BOOK_STAGE_HEIGHT,
              transform: `scale(${scale})`,
            }}
          >
            <InteractiveBook
              coverImage={coverImage}
              bookTitle={title}
              previewImages={previewImages}
              productSlug={productSlug}
              pageCount={pageCount}
              onClose={onClose}
              openOnMount
              width={BOOK_WIDTH}
              height={BOOK_HEIGHT}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
