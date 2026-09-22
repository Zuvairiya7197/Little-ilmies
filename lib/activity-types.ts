import type { ActivityType, ProductSummary } from "@/types/catalog";

/**
 * Maps each customer-facing "Activity Type" filter option to the category
 * slugs that belong to it. Purely a client-side facet over the existing
 * Category taxonomy (lib/db/catalog.ts#getCategoryHierarchy) — no schema
 * change, same pattern as the mobile Books/Activities segmented control
 * this replaces (see ACTIVITY_CATEGORY_SLUGS history in shop-view.tsx).
 *
 * "Learning" has no slug list: it's the catch-all for anything that isn't
 * one of the other seven buckets below, so it stays correct automatically
 * as new categories are added rather than needing its own long slug list.
 */
const ACTIVITY_TYPE_CATEGORY_SLUGS: Record<Exclude<ActivityType, "Learning">, string[]> = {
  Colouring: ["coloring-books"],
  Tracing: ["tracing-activities", "pre-writing-and-tracing"],
  Worksheets: ["worksheets"],
  Activities: ["activity-books", "crafts", "games", "puzzles", "flashcards", "posters"],
  Stories: [
    "islamic-stories",
    "educational-stories",
    "moral-stories",
    "stories-of-the-prophets",
    "stories-from-the-quran",
  ],
  Recipes: ["cooking-for-kids"],
  Reading: ["beginner-readers", "quran-reading", "arabic-reading"],
};

const NON_LEARNING_SLUGS = new Set(Object.values(ACTIVITY_TYPE_CATEGORY_SLUGS).flat());

export const activityTypes: ActivityType[] = [
  "Colouring",
  "Tracing",
  "Worksheets",
  "Activities",
  "Stories",
  "Recipes",
  "Reading",
  "Learning",
];

export function productMatchesActivityType(product: Pick<ProductSummary, "category" | "categorySlugs">, type: ActivityType): boolean {
  const slugs = product.categorySlugs?.length ? product.categorySlugs : [product.category.slug];
  if (type === "Learning") {
    return slugs.some((slug) => !NON_LEARNING_SLUGS.has(slug));
  }
  const bucketSlugs = ACTIVITY_TYPE_CATEGORY_SLUGS[type];
  return slugs.some((slug) => bucketSlugs.includes(slug));
}
