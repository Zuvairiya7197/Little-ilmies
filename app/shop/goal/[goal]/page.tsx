import type { Metadata } from "next";
import { Suspense } from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/store/shop/shop-view";
import { ProductGridSkeleton } from "@/components/store/shop/product-card-skeleton";
import { getAllCategories, getPublishedProducts } from "@/lib/db/catalog";
import { learningGoals, getLearningGoalBySlug } from "@/lib/learning-goals";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

interface PageProps {
  params: Promise<{ goal: string }>;
}

export const revalidate = 60;

const resolveGoal = cache(async (slug: string) => {
  const goal = getLearningGoalBySlug(slug);
  if (!goal) return null;

  const [products, categories] = await Promise.all([getPublishedProducts(), getAllCategories()]);
  return {
    title: goal.label,
    description: `Books and activities to help your child learn ${goal.label.toLowerCase()}.`,
    matchedProducts: products.filter((p) => p.learningGoals?.includes(goal.slug)),
    categories,
  };
});

export async function generateStaticParams() {
  return learningGoals.map((goal) => ({ goal: goal.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { goal } = await params;
  const resolved = await resolveGoal(goal);
  if (!resolved) return {};

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: `/shop/goal/${goal}`,
    },
  };
}

export default async function LearningGoalShopPage({ params }: PageProps) {
  const { goal } = await params;
  const resolved = await resolveGoal(goal);

  if (!resolved) notFound();

  const breadcrumb = breadcrumbSchema([
    { name: "Shop", path: "/shop" },
    { name: resolved.title, path: `/shop/goal/${goal}` },
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
