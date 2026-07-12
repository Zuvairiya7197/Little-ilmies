import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Category
        </Link>
      </div>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/admin/categories/${category.id}`}
                className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-cream-100"
              >
                <div>
                  <p className="font-semibold text-ink-600">{category.name}</p>
                  <p className="text-xs text-ink-300">/{category.slug}</p>
                </div>
                <span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-bold text-sage-700">
                  {category._count.products} product{category._count.products !== 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No categories yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
