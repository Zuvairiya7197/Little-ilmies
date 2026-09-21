import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { categoryCoverUrl } from "@/lib/catalog-assets";

export const metadata: Metadata = {
  title: "Edit Category",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const [category, parentOptionsRaw] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!category) notFound();

  // A category can't be its own parent, and (kept two levels deep) a
  // category that already has children can't become someone else's child.
  const childCount = await prisma.category.count({ where: { parentId: category.id } });
  const parentOptions =
    childCount > 0 ? [] : parentOptionsRaw.filter((parent) => parent.id !== category.id);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Edit Category
      </h1>
      <CategoryForm
        categoryId={category.id}
        parentOptions={parentOptions}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
          parentId: category.parentId ?? "",
          isFeaturedOnHomepage: category.isFeaturedOnHomepage,
          displayOrder: category.displayOrder,
          iconKey: category.iconKey ?? "",
          accentColor: category.accentColor ?? "",
        }}
        currentCoverImage={
          category.coverImage ? categoryCoverUrl(category.id, category.coverImage) : undefined
        }
      />
    </div>
  );
}
