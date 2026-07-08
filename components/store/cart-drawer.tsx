"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore, selectCartCount } from "@/lib/store/use-cart-store";
import { useCartLineItems } from "@/hooks/use-cart-line-items";
import { formatPrice } from "@/lib/utils/format";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const count = useCartStore(selectCartCount);
  const lineItems = useCartLineItems();
  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const currencyCode = lineItems[0]?.currencyCode;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink-500/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-cream-50 shadow-lifted"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink-600">
                Your Cart {count > 0 && `(${count})`}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="tap-target flex items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-400">
                  <ShoppingBag className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-ink-600">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-ink-300">
                    Browse our collection and find your child&apos;s next favourite book.
                  </p>
                </div>
                <Link href="/shop" onClick={closeCart} className="btn-primary mt-2">
                  Browse Books
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
                  {lineItems.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                        <Image
                          src={item.coverImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink-600">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-ink-400">
                            {formatPrice(item.unitPrice, item.currencyCode)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="tap-target -ml-2 self-start text-xs font-semibold text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="safe-bottom border-t border-ink-100 px-5 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-400">Subtotal</span>
                    <span className="font-display text-lg font-semibold text-ink-600">
                      {currencyCode ? formatPrice(subtotal, currencyCode) : null}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="tap-target mt-3 flex w-full items-center justify-center text-sm font-semibold text-ink-400 hover:text-ink-600"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
