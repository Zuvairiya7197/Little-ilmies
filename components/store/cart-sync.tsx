"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore, type CartItem } from "@/lib/store/use-cart-store";

const LAST_SYNCED_KEY = "little-ilmies-cart-synced";

/** The books in a cart: custom bundle lines count as the books chosen. */
function cartProductIds(items: CartItem[]) {
  const ids = items.flatMap((item) =>
    item.type === "CUSTOM_BUNDLE" ? (item.selectedProductIds ?? []) : [item.productId],
  );
  return [...new Set(ids)].sort();
}

function readLastSynced() {
  try {
    return localStorage.getItem(LAST_SYNCED_KEY);
  } catch {
    return null;
  }
}

function writeLastSynced(value: string) {
  try {
    localStorage.setItem(LAST_SYNCED_KEY, value);
  } catch {
    // Storage blocked — we just sync again next time.
  }
}

/**
 * Saves a signed-in buyer's cart to their account (PUT /api/cart) so the
 * admin can see abandoned carts. Debounced, and skipped when nothing changed
 * since this browser last saved. An empty cart is only sent when this
 * browser previously saved a non-empty one, so signing in on a new device
 * doesn't wipe the cart saved from another.
 */
export function CartSync() {
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const userId = session?.user?.id;

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    const productIds = cartProductIds(items);
    const signature = `${userId}:${productIds.join(",")}`;
    const lastSynced = readLastSynced();
    if (signature === lastSynced) return;
    if (productIds.length === 0 && !lastSynced?.startsWith(`${userId}:`)) return;

    const timer = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      })
        .then((res) => {
          if (res.ok) writeLastSynced(signature);
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [items, status, userId]);

  return null;
}
