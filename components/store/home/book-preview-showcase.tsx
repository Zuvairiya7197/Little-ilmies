"use client";

import { useState } from "react";
import Link from "next/link";
import { InteractiveBook } from "@/components/book-preview/interactive-book";

export interface HomepageSampleProduct {
  slug: string;
  title: string;
  coverImage: string;
  pageCount: number;
  previewImages: string[];
}

export function BookPreviewShowcase({ product }: { product: HomepageSampleProduct | null }) {
  const [previewKey, setPreviewKey] = useState(0);

  if (!product) return null;

  const buyHref = `/product/${product.slug}`;

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

        <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
          <div className="flex min-h-[31rem] w-full items-center justify-center overflow-visible px-8 py-8">
            <div className="origin-center scale-[0.56] xs:scale-[0.68] sm:scale-[0.82] md:scale-90 lg:scale-100">
              <InteractiveBook
                key={previewKey}
                coverImage={product.coverImage}
                bookTitle={product.title}
                previewImages={product.previewImages}
                productSlug={product.slug}
                pageCount={product.pageCount}
                onClose={() => setPreviewKey((key) => key + 1)}
                width={300}
                height={410}
              />
            </div>
          </div>

          <p className="mt-2 text-center text-xs font-medium text-ink-400">
            Click the book to flip through {product.previewImages.length} sample page{product.previewImages.length === 1 ? "" : "s"}.
            {" "}Full book is {product.pageCount} pages.
          </p>
        </div>
      </div>
    </section>
  );
}
