"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/use-cart-store";

/** Empties the cart after a checkout that left the site to take payment. */
export function ClearCart() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
