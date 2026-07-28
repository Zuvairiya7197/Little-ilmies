import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import { productCoverUrl } from "@/lib/catalog-assets";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false },
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { prices: true, categories: { include: { category: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      <AdminProductsList
        products={products.map((product) => ({
          ...product,
          coverImage: productCoverUrl(product.id, product.coverImage),
        }))}
      />
    </div>
  );
}
