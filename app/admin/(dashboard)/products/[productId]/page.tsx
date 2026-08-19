import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { productCoverUrl, productPreviewUrls } from "@/lib/catalog-assets";
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
        currentFiles={{
          coverImage: productCoverUrl(product.id, product.coverImage),
          hasPdf: Boolean(product.privatePdfPath),
          pdfFileName: product.pdfFileName ?? undefined,
          pdfFileSize: product.pdfFileSize ?? undefined,
          previewPageCount: product.previewImagePaths.length,
          previewImages: productPreviewUrls(product.id, product.previewImagePaths),
        }}
        defaultValues={{
          title: product.title,
          author: product.author ?? undefined,
          sku: product.sku ?? undefined,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          categoryIds: product.categories.map((c) => c.categoryId),
          tags: product.tags,
          ageRange: product.ageRange as never,
          language: product.language as never,
          format: product.format as never,
          pageCount: product.pageCount,
          isBestseller: product.isBestseller,
          isNewArrival: product.isNewArrival,
          isFeatured: product.isFeatured,
          displayOrder: product.displayOrder ?? undefined,
          hasFreePreview: product.hasFreePreview,
          isHomepageSample: product.isHomepageSample,
          whatsIncluded: product.whatsIncluded,
          learningObjectives: product.learningObjectives,
          suitableFor: product.suitableFor,
          usageLicense: product.usageLicense,
          licenseInfo: product.licenseInfo ?? undefined,
          baseCurrency: product.baseCurrency as CurrencyCode,
          productVersion: product.productVersion ?? undefined,
          status: product.status,
          seoTitle: product.seoTitle ?? undefined,
          seoDescription: product.seoDescription ?? undefined,
          seoKeywords: product.seoKeywords,
          prices: product.prices.map((p) => ({
            currencyCode: p.currencyCode as CurrencyCode,
            regularPrice: p.regularPrice / 100,
            salePrice: p.salePrice ? p.salePrice / 100 : undefined,
            saleStartDate: p.saleStartDate ? p.saleStartDate.toISOString().slice(0, 10) : undefined,
            saleEndDate: p.saleEndDate ? p.saleEndDate.toISOString().slice(0, 10) : undefined,
            isActive: p.isActive,
          })),
        }}
      />
    </div>
  );
}
