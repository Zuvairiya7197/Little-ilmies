import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "Add Category",
  robots: { index: false },
};

export default async function NewCategoryPage() {
  const parentOptions = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Add Category
      </h1>
      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
