import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/store/shop/shop-view";
import { ProductGridSkeleton } from "@/components/store/shop/product-card-skeleton";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop All Books",
  description:
    "Browse the full Little Ilmies collection of Islamic and educational e-books for children. Filter by category, age, language, and price.",
  alternates: {
    canonical: "/shop",
  },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-content py-8"><ProductGridSkeleton /></div>}>
      <ShopView products={products} title="All Books" description="Browse our full collection of Islamic and educational e-books for children." />
    </Suspense>
  );
}
