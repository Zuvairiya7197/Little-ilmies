import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { productId } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { categories: true, prices: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
          Edit Product
        </h1>
        <DeleteProductButton productId={product.id} />
      </div>
      <ProductForm
        categories={categories}
        productId={product.id}
        defaultValues={{
          title: product.title,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          categoryIds: product.categories.map((c) => c.categoryId),
          ageRange: product.ageRange as never,
          language: product.language as never,
          format: product.format as never,
          pageCount: product.pageCount,
          isBestseller: product.isBestseller,
          isNewArrival: product.isNewArrival,
          hasFreePreview: product.hasFreePreview,
          status: product.status,
          seoTitle: product.seoTitle ?? undefined,
          seoDescription: product.seoDescription ?? undefined,
          prices: product.prices.map((p) => ({
            currencyCode: p.currencyCode as CurrencyCode,
            regularPrice: p.regularPrice / 100,
            salePrice: p.salePrice ? p.salePrice / 100 : undefined,
            isActive: p.isActive,
          })),
        }}
      />
    </div>
  );
}
