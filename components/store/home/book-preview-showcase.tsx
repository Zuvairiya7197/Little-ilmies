"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HomepageSampleProduct {
  slug: string;
  title: string;
  pageCount: number;
  previewImages: string[];
}

export function BookPreviewShowcase({ product }: { product: HomepageSampleProduct | null }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [flippingImage, setFlippingImage] = useState<string | null>(null);

  useEffect(() => {
    product?.previewImages.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, [product?.previewImages]);

  if (!product) return null;

  const isLastSample = index === product.previewImages.length - 1;
  const buyHref = `/product/${product.slug}`;
  const lastPreviewIndex = product.previewImages.length - 1;
  const coverImage = product.previewImages[0];
  const leftImage = product.previewImages[Math.max(0, index - 1)];
  const rightImage = product.previewImages[index];
  const nextImage = product.previewImages[Math.min(lastPreviewIndex, index + 1)];

  function goToPreviousPage() {
    setDirection(-1);
    setFlippingImage(leftImage);
    if (index <= 1) {
      setIsOpen(false);
      setIndex(0);
      return;
    }
    setIndex((i) => Math.max(1, i - 1));
  }

  function goToNextPage() {
    setDirection(1);
    setFlippingImage(isOpen ? rightImage : coverImage);
    if (!isOpen) {
      setIsOpen(true);
      setIndex(Math.min(1, lastPreviewIndex));
      return;
    }
    setIndex((i) => Math.min(lastPreviewIndex, i + 1));
  }

  return (
    <section
      aria-labelledby="preview-heading"
      className="bg-sage-50 py-12 xs:py-14 md:py-20"
    >
      <div className="container-content grid grid-cols-1 items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
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

        <div className="mx-auto w-full max-w-2xl">
          <div
            className="relative aspect-[4/3] overflow-visible rounded-2xl"
            role="group"
            aria-roledescription="carousel"
            aria-label={`Sample pages from ${product.title}`}
          >
            <div className="absolute inset-x-8 bottom-0 h-8 rounded-full bg-ink-700/10 blur-xl" aria-hidden="true" />
            {!isOpen ? (
              <motion.button
                type="button"
                onClick={goToNextPage}
                className="absolute left-1/2 top-1/2 h-full max-h-[31rem] w-[min(72%,23rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-cream-50 shadow-lifted ring-1 ring-ink-100"
                initial={false}
                animate={{ rotateY: 0 }}
                whileHover={{ rotateY: -8, y: -4 }}
                transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
                style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
                aria-label={`Open sample book for ${product.title}`}
              >
                <Image
                  src={coverImage}
                  alt={`${product.title} book cover`}
                  fill
                  sizes="(max-width: 768px) 72vw, 368px"
                  className="object-contain object-center p-3"
                  loading="eager"
                  priority
                />
              </motion.button>
            ) : (
              <div className="absolute inset-0 rounded-2xl bg-cream-100 p-4 shadow-lifted">
                <div className="absolute left-1/2 top-4 z-20 h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-ink-200/70 to-transparent shadow-[0_0_18px_rgba(45,24,79,0.22)]" aria-hidden="true" />
                <div className="flex h-full overflow-hidden rounded-xl bg-cream-50 shadow-inner">
                  <div className="relative h-full w-1/2 border-r border-ink-100 bg-cream-50">
                    <Image
                      src={leftImage}
                      alt={index === 1 ? `${product.title} book cover` : `Sample page ${index} of ${product.title}`}
                      fill
                      sizes="(max-width: 768px) 45vw, 320px"
                      className="object-contain object-center p-2"
                      loading="eager"
                      priority={index <= 1}
                    />
                  </div>
                  <div className="relative h-full w-1/2 bg-cream-50">
                    <Image
                      src={rightImage}
                      alt={`Sample page ${index + 1} of ${product.title}`}
                      fill
                      sizes="(max-width: 768px) 45vw, 320px"
                      className="object-contain object-center p-2"
                      loading="eager"
                      priority={index <= 1}
                    />
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isOpen && (!isLastSample || index < product.previewImages.length) ? (
                <motion.div
                  key={index}
                  initial={{ rotateY: direction > 0 ? 0 : -180, opacity: 0.85 }}
                  animate={{ rotateY: direction > 0 ? -180 : 0, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.72, ease: [0.645, 0.045, 0.355, 1] }}
                  className="pointer-events-none absolute inset-y-4 left-1/2 z-30 w-[calc(50%-1rem)] origin-left overflow-hidden rounded-r-xl bg-cream-50 shadow-[0_16px_38px_rgba(45,24,79,0.18)]"
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                >
                  <Image
                    src={flippingImage ?? (direction > 0 ? rightImage : nextImage)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 45vw, 320px"
                    className="object-contain object-center p-2"
                    loading="eager"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!isOpen}
              aria-label="Previous page"
              className="tap-target absolute left-0 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/95 text-ink-600 shadow-soft disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={isOpen && isLastSample}
              aria-label={isOpen ? "Next page" : "Open book preview"}
              className="tap-target absolute right-0 top-1/2 z-40 flex -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-cream-50/95 text-ink-600 shadow-soft disabled:opacity-0"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-3 text-center text-xs font-medium text-ink-400">
            {isOpen
              ? `Sample page ${Math.min(index + 1, product.previewImages.length)} of ${product.previewImages.length}`
              : "Book cover"}
            {" "}· Full book is {product.pageCount} pages
          </p>
        </div>
      </div>
    </section>
  );
}
