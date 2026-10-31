"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { PdfFormat } from "@/lib/formats";

interface ProductEntitlement {
  ownedFormats: PdfFormat[];
  activeRentalExpiresAt: string | null;
}

const NO_ENTITLEMENT: ProductEntitlement = { ownedFormats: [], activeRentalExpiresAt: null };

/** What a logged-in buyer already has for this book. Fetched in the browser
 * because the product page itself is cached and shared by every visitor. */
export function useProductEntitlement(productId: string) {
  const { status } = useSession();
  const [entitlement, setEntitlement] = useState(NO_ENTITLEMENT);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    fetch(`/api/account/product-entitlement?productId=${encodeURIComponent(productId)}`)
      .then((res) => (res.ok ? (res.json() as Promise<ProductEntitlement>) : null))
      .then((data) => {
        if (data && !cancelled) setEntitlement(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [status, productId]);

  return entitlement;
}
