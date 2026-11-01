"use client";

import { useEffect, useState } from "react";

const CASHFREE_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

declare global {
  interface Window {
    Cashfree: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<unknown>;
    };
  }
}

/** Loads Cashfree's JS SDK once and reports when window.Cashfree is ready. */
export function useCashfreeScript(enabled: boolean) {
  const [isLoaded, setIsLoaded] = useState(
    typeof window !== "undefined" && Boolean(window.Cashfree)
  );

  useEffect(() => {
    if (!enabled || isLoaded) return;
    if (document.querySelector(`script[src="${CASHFREE_SRC}"]`)) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = CASHFREE_SRC;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
  }, [enabled, isLoaded]);

  return isLoaded;
}
