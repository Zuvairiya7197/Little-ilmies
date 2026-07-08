import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/store/shop/shop-view";
import { ProductGridSkeleton } from "@/components/store/shop/product-card-skeleton";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { categoryGroups, getCategoryGroupBySlug } from "@/data/category-groups";

interface PageProps {
  params: Promise<{ category: string }>;
}

function resolveCategory(slug: string) {
  const group = getCategoryGroupBySlug(slug);
  if (group) {
    return {
      title: group.name,
      description: group.description,
      matchedProducts: products.filter((p) =>
        group.categorySlugs.includes(p.category.slug)
      ),
    };
  }

  const category = categories.find((c) => c.slug === slug);
  if (category) {
    return {
      title: category.name,
      description: category.description ?? `Browse ${category.name} e-books.`,
      matchedProducts: products.filter((p) => p.category.slug === slug),
    };
  }

  return null;
}

export async function generateStaticParams() {
  return [
    ...categoryGroups.map((g) => ({ category: g.slug })),
    ...categories.map((c) => ({ category: c.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const resolved = resolveCategory(category);
  if (!resolved) return {};

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: `/shop/${category}`,
    },
  };
}

export default async function CategoryShopPage({ params }: PageProps) {
  const { category } = await params;
  const resolved = resolveCategory(category);

  if (!resolved) notFound();

  return (
    <Suspense fallback={<div className="container-content py-8"><ProductGridSkeleton /></div>}>
      <ShopView
        products={resolved.matchedProducts}
        title={resolved.title}
        description={resolved.description}
      />
    </Suspense>
  );
}
