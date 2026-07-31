import type { Metadata } from "next";
import { WishlistView } from "@/components/store/wishlist-view";
import { getPublishedProducts } from "@/lib/db/catalog";

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

export default async function WishlistPage() {
  const products = await getPublishedProducts();
  return <WishlistView products={products} />;
}
