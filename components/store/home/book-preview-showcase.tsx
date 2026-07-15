"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";

export interface HomepageSampleProduct {
  slug: string;
  title: string;
  pageCount: number;
  previewImages: string[];
}

export function BookPreviewShowcase({ product }: { product: HomepageSampleProduct | null }) {
  const [index, setIndex] = useState(0);

  if (!product) return null;

  const isLastSample = index === product.previewImages.length - 1;
  const buyHref = `/product/${product.slug}`;

  return (
    <section
      aria-labelledby="preview-heading"
      className="bg-sage-50 py-12 xs:py-14 md:py-20"
    >
      <div className="container-content grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="section-eyebrow">See before you buy</p>
          <h2 id="preview-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Flip through real pages before you buy
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-400">
            Every book includes a free page-flip preview so you know exactly
            what you&apos;re bringing home — no surprises, just confidence.
          </p>
          <Link href={buyHref} className="btn-accent mt-6">
            Buy Now to Download Full E-Book
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-50 shadow-lifted"
            role="group"
            aria-roledescription="carousel"
            aria-label={`Sample pages from ${product.title}`}
          >
            <AnimatePresence mode="wait">
              {!isLastSample || index < product.previewImages.length ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.previewImages[index]}
                    alt={`Sample page ${index + 1} of ${product.title}`}
                    fill
                    sizes="380px"
                    className="object-cover"
                    loading="eager"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {isLastSample && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-700/75 px-6 text-center backdrop-blur-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-50/15 text-cream-50">
                  <Lock className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="font-display text-base font-semibold text-cream-50">
                  Purchase to unlock the full PDF
                </p>
                <Link href={buyHref} className="btn-accent mt-1">
                  Buy Now to Download Full E-Book
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label="Previous page"
              className="tap-target absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/90 text-ink-600 shadow-soft disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {!isLastSample && (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(product.previewImages.length - 1, i + 1))}
                aria-label="Next page"
                className="tap-target absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/90 text-ink-600 shadow-soft"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs font-medium text-ink-400">
            Sample page {Math.min(index + 1, product.previewImages.length)} of{" "}
            {product.previewImages.length} · Full book is {product.pageCount} pages
          </p>
        </div>
      </div>
    </section>
  );
}
