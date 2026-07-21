import type { Metadata } from "next";
import { CategoriesView } from "@/components/store/categories-view";
import { getAllCategories } from "@/lib/db/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Categories",
  description: "Explore all our book collections and activities.",
  alternates: {
    canonical: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return <CategoriesView categories={categories} />;
}
