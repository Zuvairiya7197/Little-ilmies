"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { BookPreviewModal } from "@/components/book-preview/book-preview-modal";
import { cn } from "@/lib/utils/cn";

export function BookPreviewCard({
  title,
  coverImage,
  previewImages,
  productSlug,
  pageCount,
  hasFreePreview,
  showCover = true,
}: {
  title: string;
  coverImage: string;
  previewImages: string[];
  productSlug: string;
  pageCount: number;
  hasFreePreview: boolean;
  showCover?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const previewAvailable = hasFreePreview && previewImages.length > 0;

  return (
    <div id="preview">
      {showCover && (
      <div className="group relative mx-auto hidden max-w-sm md:block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-200 shadow-lifted">
          <Image
            src={coverImage}
            alt={`${title} book cover`}
            fill
            sizes="(max-width: 480px) 90vw, 420px"
            className="object-contain object-center"
            priority
          />
        </div>

        {previewAvailable ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="tap-target mx-auto mt-4 flex items-center justify-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-sm font-semibold text-ink-600 shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <BookOpen className="h-4 w-4 text-ink-500" aria-hidden="true" />
            Flip Through Sample Pages
          </button>
        ) : (
          <span className="tap-target mx-auto mt-4 flex items-center justify-center gap-2 rounded-full bg-cream-100 px-5 py-2.5 text-sm font-semibold text-ink-300">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Sample Pages Coming Soon
          </span>
        )}
      </div>
      )}

      {previewAvailable && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "tap-target mx-auto mt-4 flex items-center justify-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-sm font-semibold text-ink-600 shadow-clay-sm",
            showCover && "md:hidden"
          )}
        >
          <BookOpen className="h-4 w-4 text-ink-500" aria-hidden="true" />
          Flip Through Sample Pages
        </button>
      )}

      {previewAvailable && (
        <BookPreviewModal
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          coverImage={coverImage}
          previewImages={previewImages}
          productSlug={productSlug}
          pageCount={pageCount}
        />
      )}
    </div>
  );
}
