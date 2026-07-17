"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import type { ProductSummary } from "@/types/catalog";

/** Shared horizontal product carousel — desktop shows scroll arrows once
 * content overflows, mobile relies on native swipe with scroll-snap. */
export function ProductCarousel({ products }: { products: ProductSummary[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products]);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative md:px-10">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="Scroll left"
          className="tap-target absolute left-0 top-[35%] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-ink-600 shadow-clay md:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="Scroll right"
          className="tap-target absolute right-0 top-[35%] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-ink-600 shadow-clay md:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      <ul
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 md:mx-0 md:px-0"
      >
        {products.map((product, i) => (
          <li key={product.id} className="w-[45vw] shrink-0 snap-start xs:w-[38vw] sm:w-[30vw] md:w-[240px]">
            <ProductCard product={product} tintIndex={i} />
          </li>
        ))}
      </ul>
    </div>
  );
}
