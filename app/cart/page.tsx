import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the books in your Little Ilmies cart before checkout.",
  alternates: {
    canonical: "/cart",
  },
  robots: {
    index: false,
  },
};

export default function CartPage() {
  return <CartView />;
}
