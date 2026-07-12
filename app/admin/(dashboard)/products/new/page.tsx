import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Add Product",
  robots: { index: false },
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Add Product
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
