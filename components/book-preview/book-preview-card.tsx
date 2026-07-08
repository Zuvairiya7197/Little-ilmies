"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { BookPreviewModal } from "@/components/book-preview/book-preview-modal";

export function BookPreviewCard({
  title,
  coverImage,
  previewImages,
  productSlug,
  pageCount,
  hasFreePreview,
}: {
  title: string;
  coverImage: string;
  previewImages: string[];
  productSlug: string;
  pageCount: number;
  hasFreePreview: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div id="preview">
      <div className="group relative mx-auto max-w-sm">
        <div
          className="pointer-events-none absolute inset-x-0 top-2 -right-2 aspect-[3/4] rounded-2xl bg-sage-200/60"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-4 -right-4 aspect-[3/4] rounded-2xl bg-sage-100/50"
          aria-hidden="true"
        />

        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-200 shadow-lifted">
          <Image
            src={coverImage}
            alt={`${title} book cover`}
            fill
            sizes="(max-width: 480px) 90vw, 420px"
            className="object-cover"
            priority
          />
        </div>

        {hasFreePreview && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-primary mx-auto mt-4 flex w-full max-w-xs items-center justify-center gap-2 xs:w-auto"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Flip Through Sample Pages
          </button>
        )}
      </div>

      {hasFreePreview && (
        <BookPreviewModal
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          previewImages={previewImages}
          productSlug={productSlug}
          pageCount={pageCount}
        />
      )}
    </div>
  );
}
