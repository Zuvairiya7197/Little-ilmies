import type { Metadata } from "next";
import { WishlistView } from "@/components/store/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Books you've saved to your Little Ilmies wishlist.",
  alternates: {
    canonical: "/wishlist",
  },
  robots: {
    index: false,
  },
};

export default function WishlistPage() {
  return <WishlistView />;
}
