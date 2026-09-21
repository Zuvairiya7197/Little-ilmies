import type { Metadata } from "next";
import { CollectionsView } from "@/components/store/collections-view";
import { getFeaturedCategories } from "@/lib/db/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Featured Collections",
  description:
    "Explore handpicked e-books and activities that inspire faith, build character, and make learning delightful.",
  alternates: {
    canonical: "/collections",
  },
};

export default async function CollectionsPage() {
  const categories = await getFeaturedCategories();
  return <CollectionsView categories={categories} />;
}
