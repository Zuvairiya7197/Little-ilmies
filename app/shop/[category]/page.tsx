import type { Metadata } from "next";
import { Suspense } from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/store/shop/shop-view";
import { ProductGridSkeleton } from "@/components/store/shop/product-card-skeleton";
import { getAllCategories, getPublishedProducts } from "@/lib/db/catalog";
import { categoryGroups, getCategoryGroupBySlug } from "@/data/category-groups";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

interface PageProps {
  params: Promise<{ category: string }>;
}

export const revalidate = 60;

const resolveCategory = cache(async (slug: string) => {
  const group = getCategoryGroupBySlug(slug);
  const [products, categories] = await Promise.all([getPublishedProducts(), getAllCategories()]);

  if (group) {
    return {
      title: group.name,
      description: group.description,
      matchedProducts: products.filter((p) => group.categorySlugs.includes(p.category.slug)),
      categories: categories.filter((c) => group.categorySlugs.includes(c.slug)),
    };
  }

  const category = categories.find((c) => c.slug === slug);
  if (category) {
    return {
      title: category.name,
      description: category.description ?? `Browse ${category.name} e-books.`,
      matchedProducts: products.filter((p) => p.category.slug === slug),
      categories,
    };
  }

  return null;
});

export async function generateStaticParams() {
  // If the DB is unreachable at build time, fall back to just the static
  // category groups — revalidate = 60 covers any DB-backed category slug
  // on first request. See app/product/[slug]/page.tsx for the same pattern.
  try {
    const categories = await getAllCategories();
    return [
      ...categoryGroups.map((g) => ({ category: g.slug })),
      ...categories.map((c) => ({ category: c.slug })),
    ];
  } catch {
    return categoryGroups.map((g) => ({ category: g.slug }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const resolved = await resolveCategory(category);
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
  const resolved = await resolveCategory(category);

  if (!resolved) notFound();

  const breadcrumb = breadcrumbSchema([
    { name: "Shop", path: "/shop" },
    { name: resolved.title, path: `/shop/${category}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Suspense fallback={<div className="container-content py-8"><ProductGridSkeleton /></div>}>
        <ShopView
          products={resolved.matchedProducts}
          categories={resolved.categories}
          title={resolved.title}
          description={resolved.description}
        />
      </Suspense>
    </>
  );
}
