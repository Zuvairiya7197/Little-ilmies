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
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Edit Category
      </h1>
      <CategoryForm
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
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
