import type { Metadata } from "next";
import { CheckoutView } from "@/components/store/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase — secure checkout, instant digital delivery.",
  alternates: {
    canonical: "/checkout",
  },
  robots: {
    index: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
