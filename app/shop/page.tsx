import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/store/shop/shop-view";
import { ShopFallback } from "@/components/store/shop/shop-fallback";
import { getActiveBundles, getAllCategories, getPublishedProducts } from "@/lib/db/catalog";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Shop All Books",
  description:
    "Browse the full Little Ilmies collection of Islamic and educational e-books for children. Filter by category, age, language, and price.",
  alternates: {
    canonical: "/shop",
  },
};

export default async function ShopPage() {
  const [products, categories, bundles] = await Promise.all([
    getPublishedProducts(),
    getAllCategories(),
    getActiveBundles(),
  ]);

  return (
    <Suspense fallback={<ShopFallback products={products} title="All Books" description="Browse our full collection of Islamic and educational e-books for children." />}>
      <ShopView
        products={products}
        bundles={bundles}
        categories={categories}
        title="All Books"
        description="Browse our full collection of Islamic and educational e-books for children."
      />
    </Suspense>
  );
}
