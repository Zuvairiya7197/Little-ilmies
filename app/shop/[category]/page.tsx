import type { Metadata } from "next";
import { Suspense } from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/store/shop/shop-view";
import { ProductGridSkeleton } from "@/components/store/shop/product-card-skeleton";
import { getAllCategories, getPublishedProducts } from "@/lib/db/catalog";
import { legacyCategoryGroupSlugs } from "@/data/category-groups";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import type { ProductSummary } from "@/types/catalog";

interface PageProps {
  params: Promise<{ category: string }>;
}

export const revalidate = 60;

const AGE_CATEGORY_TO_RANGE = {
  "0-3-years": "0-3",
  "3-6-years": "3-6",
  "6-9-years": "6-9",
  "9-12-years": "9-12",
  "12-plus-years": "12+",
} as const;

// Legacy top-level group slugs from the old 3-group static system, mapped
// to their closest equivalent in the new 8-group DB-driven hierarchy so
// any old bookmarked/shared link (e.g. /shop/islamic-books) still resolves
// instead of 404ing. "islamic-books" -> "islamic-studies" is a rename, not
// an exact 1:1 (the old group also included quran-and-arabic + good-manners,
// which are now nested under islamic-studies/other parents), but it's the
// closest live equivalent and preserves the link.
const LEGACY_GROUP_REDIRECTS: Record<string, string> = {
  "islamic-books": "islamic-studies",
  "educational-books": "early-learning",
  "gifts-games": "activities-and-printables",
};

const resolveCategory = cache(async (slugParam: string) => {
  const slug = LEGACY_GROUP_REDIRECTS[slugParam] ?? slugParam;
  const [products, categories] = await Promise.all([getPublishedProducts(), getAllCategories()]);
  const productHasCategory = (product: ProductSummary, categorySlug: string) =>
    product.categorySlugs?.includes(categorySlug) || product.category.slug === categorySlug;

  const category = categories.find((c) => c.slug === slug);
  if (category) {
    const ageRange = AGE_CATEGORY_TO_RANGE[slug as keyof typeof AGE_CATEGORY_TO_RANGE];
    // Top-level categories in the new hierarchy (e.g. islamic-studies,
    // mathematics) aggregate products from all of their children, same UX
    // as the old category-groups.ts group pages.
    const childSlugs = categories.filter((c) => c.parentId === category.id).map((c) => c.slug);
    const isParentGroup = childSlugs.length > 0;
    const matchedProducts = ageRange
      ? products.filter((p) => p.ageRange === ageRange)
      : isParentGroup
        ? products.filter((p) => productHasCategory(p, slug) || childSlugs.some((childSlug) => productHasCategory(p, childSlug)))
        : products.filter((p) => productHasCategory(p, slug));

    return {
      title: category.name,
      description: category.description ?? `Browse ${category.name} e-books.`,
      matchedProducts,
      categories: isParentGroup ? categories.filter((c) => c.id === category.id || childSlugs.includes(c.slug)) : categories,
    };
  }

  return null;
});

export async function generateStaticParams() {
  // If the DB is unreachable at build time, fall back to just the legacy
  // group slugs — revalidate = 60 covers any DB-backed category slug on
  // first request. See app/product/[slug]/page.tsx for the same pattern.
  try {
    const categories = await getAllCategories();
    return [
      ...legacyCategoryGroupSlugs.map((slug) => ({ category: slug })),
      ...categories.map((c) => ({ category: c.slug })),
    ];
  } catch {
    return legacyCategoryGroupSlugs.map((slug) => ({ category: slug }));
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
