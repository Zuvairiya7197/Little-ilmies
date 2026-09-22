import type { Metadata } from "next";
import { CollectionsView } from "@/components/store/collections-view";
import { getFeaturedCategories } from "@/lib/db/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Featured Collections",
  description:
    "Thoughtfully created e-books and activities to help children learn about their Deen, discover the world around them, build useful skills, and enjoy learning along the way.",
  alternates: {
    canonical: "/collections",
  },
};

export default async function CollectionsPage() {
  const categories = await getFeaturedCategories();
  return <CollectionsView categories={categories} />;
}
