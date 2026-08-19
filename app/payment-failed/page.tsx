import type { Metadata } from "next";
import { Mail, RotateCcw, ShoppingCart } from "lucide-react";
import { ErrorScreen } from "@/components/ui/error-screen";

export const metadata: Metadata = {
  title: "Payment Failed",
  robots: { index: false },
};

export default function PaymentFailedPage() {
  return (
    <ErrorScreen
      eyebrow="Payment issue"
      title="Payment Failed"
      description="Something went wrong while processing your payment. You haven't been charged, so you can safely try again."
      image="/images/Payment failed.png"
      imageAlt="Payment failed illustration"
      actions={[
        { href: "/checkout", label: "Retry Payment", icon: RotateCcw },
        { href: "/cart", label: "Return to Cart", icon: ShoppingCart, variant: "secondary" },
        { href: "/contact", label: "Contact Support", icon: Mail, variant: "plain" },
      ]}
    />
  );
}
