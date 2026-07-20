"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useProductPrice } from "@/hooks/use-product-price";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: ProductSummary | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose]);

  if (!mounted) return null;

  // Rendered via portal at the document root — this modal is triggered from
  // inside ProductCard, whose root has a hover transform (`hover:-translate-y-1`).
  // A transformed ancestor creates a new containing block for `position: fixed`
  // descendants, which would otherwise pin this modal to the card instead of
  // the viewport.
  return createPortal(
    <AnimatePresence>
      {product && <QuickViewContent product={product} onClose={onClose} />}
    </AnimatePresence>,
    document.body
  );
}

function QuickViewContent({ product, onClose }: { product: ProductSummary; onClose: () => void }) {
  const addItem = useCartStore((s) => s.addItem);
  const resolvedPrice = useProductPrice(product);
  const displayPrice = resolvedPrice.salePrice ?? resolvedPrice.regularPrice;
  const isOnSale = Boolean(resolvedPrice.salePrice);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[80] bg-ink-500/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Positioning lives on this static wrapper, separate from the
          motion.div below — Framer Motion writes its own inline `transform`
          once the scale animation settles, which would otherwise clobber a
          Tailwind translate utility applied to the same element and break
          the centering. */}
      <div className="fixed inset-x-4 top-1/2 z-[90] mx-auto max-w-lg -translate-y-1/2 xs:inset-x-6 sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${product.title}`}
          className="relative max-h-[85vh] overflow-y-auto rounded-3xl bg-cream-50 shadow-lifted"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Sticky (not absolute) so the close button stays reachable even
              when short viewports force the content below to scroll. */}
          <div className="sticky top-2 z-10 h-0 overflow-visible">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick view"
              className="tap-target absolute right-2 top-0 flex items-center justify-center rounded-full bg-cream-50/90 text-ink-500 shadow-soft backdrop-blur hover:text-ink-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
            <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl bg-cream-200 sm:w-40">
              <Image
                src={product.coverImage}
                alt={`${product.title} book cover`}
                fill
                sizes="(max-width: 639px) 90vw, 160px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sage-600">
                {product.category.name}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold leading-snug text-ink-700">
                {product.title}
              </h2>

              <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-300">
                {product.reviewCount > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" aria-hidden="true" />
                      {product.rating.toFixed(1)}
                    </span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span>Ages {product.ageRange}</span>
                <span aria-hidden="true">·</span>
                <span>{product.pageCount}pg</span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-400">
                {product.shortDescription}
              </p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-xl font-semibold text-ink-600">
                  {formatPrice(displayPrice, resolvedPrice.currencyCode)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-ink-300 line-through">
                    {formatPrice(resolvedPrice.regularPrice, resolvedPrice.currencyCode)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      productId: product.id,
                      slug: product.slug,
                      title: product.title,
                      coverImage: product.coverImage,
                    });
                    onClose();
                  }}
                  className="btn-primary flex-1"
                >
                  Add to Cart
                </button>
                <Link href={`/product/${product.slug}`} onClick={onClose} className="btn-secondary flex-1">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
