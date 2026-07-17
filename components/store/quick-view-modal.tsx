"use client";

import { useEffect } from "react";
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

  return (
    <AnimatePresence>
      {product && <QuickViewContent product={product} onClose={onClose} />}
    </AnimatePresence>
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
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.title}`}
        className="fixed inset-x-4 top-1/2 z-[90] mx-auto max-w-lg -translate-y-1/2 overflow-hidden rounded-3xl bg-cream-50 shadow-lifted xs:inset-x-6 sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="tap-target absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-cream-50/90 text-ink-500 shadow-soft backdrop-blur hover:text-ink-700"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-col gap-5 p-5 xs:flex-row xs:p-6">
          <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl bg-cream-200 xs:w-40">
            <Image
              src={product.coverImage}
              alt={`${product.title} book cover`}
              fill
              sizes="(max-width: 480px) 90vw, 160px"
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

            <div className="mt-4 flex flex-col gap-2 xs:flex-row">
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
    </>
  );
}
