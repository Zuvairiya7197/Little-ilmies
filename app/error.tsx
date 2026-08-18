"use client";

import { Home, RotateCcw, ShoppingBag } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      eyebrow="Something went wrong"
      title="We couldn't load this page."
      description="Please try again. If it keeps happening, head back to the shop and continue browsing from there."
      image="/images/contact support.png"
      imageAlt="Customer support illustration"
      actions={[
        { label: "Try Again", icon: RotateCcw, onClick: reset },
        { href: "/shop", label: "Browse Books", icon: ShoppingBag, variant: "secondary" },
        { href: "/", label: "Go to Home", icon: Home, variant: "plain" },
      ]}
    />
  );
}
