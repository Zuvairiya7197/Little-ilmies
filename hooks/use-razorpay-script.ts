"use client";

import { useEffect, useState } from "react";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/** Loads Razorpay's Checkout.js once and reports when window.Razorpay is ready. */
export function useRazorpayScript() {
  const [isLoaded, setIsLoaded] = useState(
    typeof window !== "undefined" && Boolean(window.Razorpay)
  );

  useEffect(() => {
    if (isLoaded) return;
    if (document.querySelector(`script[src="${RAZORPAY_SRC}"]`)) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
  }, [isLoaded]);

  return isLoaded;
}
