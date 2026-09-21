import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { DeleteAdminResourceButton } from "@/components/admin/delete-admin-resource-button";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const parents = categories
    .filter((category) => !category.parentId)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const childrenByParentId = new Map<string, typeof categories>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const list = childrenByParentId.get(category.parentId) ?? [];
    list.push(category);
    childrenByParentId.set(category.parentId, list);
  }
  for (const list of childrenByParentId.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Category
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {parents.map((parent) => {
          const children = childrenByParentId.get(parent.id) ?? [];
          return (
            <div key={parent.id} className="card-surface overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-cream-100 p-4">
                <Link href={`/admin/categories/${parent.id}`} className="min-w-0 flex-1">
                  <p className="font-display font-bold text-ink-700">{parent.name}</p>
                  <p className="text-xs text-ink-300">/{parent.slug}</p>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-bold text-sage-700">
                    {parent._count.products} product{parent._count.products !== 1 ? "s" : ""}
                  </span>
                  <DeleteAdminResourceButton endpoint={`/api/admin/categories/${parent.id}`} label="category" />
                </div>
              </div>
              <ul className="divide-y divide-ink-100">
                {children.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-3 py-3 pl-8 pr-4 transition-colors hover:bg-cream-100"
                  >
                    <Link href={`/admin/categories/${category.id}`} className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-600">{category.name}</p>
                      <p className="text-xs text-ink-300">/{category.slug}</p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-bold text-sage-700">
                        {category._count.products} product{category._count.products !== 1 ? "s" : ""}
                      </span>
                      <DeleteAdminResourceButton endpoint={`/api/admin/categories/${category.id}`} label="category" />
                    </div>
                  </li>
                ))}
                {children.length === 0 && (
                  <li className="p-4 text-center text-xs text-ink-300">No child categories yet.</li>
                )}
              </ul>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="card-surface p-8 text-center text-sm text-ink-300">No categories yet.</div>
        )}
      </div>
    </div>
  );
}
