// Single source of truth for the 8 "Shop by Learning Goal" topics — used by
// the homepage cards (components/store/home/shop-by-learning-goal.tsx), the
// admin product form's Learning Goals picker, and /shop/goal/[goal] filtering.
// Independent of the Category/ProductCategory taxonomy.
export const learningGoals = [
  { slug: "early-learning", label: "Early Learning" },
  { slug: "islamic-studies", label: "Islamic Studies" },
  { slug: "stem-learning", label: "STEM Learning" },
  { slug: "quran-and-arabic", label: "Quran & Arabic" },
  { slug: "character-building", label: "Character Building" },
  { slug: "islamic-stories", label: "Islamic Stories" },
  { slug: "creative-arts", label: "Creative Arts" },
  { slug: "life-skills", label: "Life Skills" },
] as const;

export type LearningGoalSlug = (typeof learningGoals)[number]["slug"];

export function getLearningGoalBySlug(slug: string) {
  return learningGoals.find((goal) => goal.slug === slug);
}
