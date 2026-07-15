"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/types/catalog";

export function FeaturedCategories({ categories }: { categories: Category[] }) {
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
  }, [categories]);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  return (
    <section aria-labelledby="categories-heading" className="py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="mb-6 flex items-end justify-between gap-4 xs:mb-8">
          <div>
            <p className="section-eyebrow">Browse by category</p>
            <h2 id="categories-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
              Find the right book for your child
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline md:block"
          >
            View all
          </Link>
        </div>

        <div className="relative md:px-10">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              aria-label="Scroll categories left"
              className="tap-target absolute left-0 top-[2.5rem] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-ink-600 shadow-clay md:flex xs:top-12"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              aria-label="Scroll categories right"
              className="tap-target absolute right-0 top-[2.5rem] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-ink-600 shadow-clay md:flex xs:top-12"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          <ul
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 xs:gap-6 md:mx-0 md:px-0"
          >
            {categories.map((cat) => (
              <li key={cat.slug} className="w-20 shrink-0 snap-start xs:w-24">
                <Link
                  href={`/shop/${cat.slug}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="relative aspect-square w-20 overflow-hidden rounded-full bg-cream-200 shadow-soft transition-shadow duration-300 group-hover:shadow-clay xs:w-24">
                    <Image
                      src={cat.coverImage}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <p className="line-clamp-2 text-center text-xs font-semibold leading-tight text-ink-600 xs:text-sm">
                    {cat.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/shop"
            className="text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
          >
            View all categories
          </Link>
        </div>
      </div>
    </section>
  );
}
