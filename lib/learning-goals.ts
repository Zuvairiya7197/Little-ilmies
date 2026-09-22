import {
  GraduationCap,
  Moon,
  Rocket,
  BookOpen,
  Heart,
  Feather,
  Palette,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the 8 "Shop by Learning Goal" topics — used by
 * the homepage cards (components/store/home/shop-by-learning-goal.tsx), the
 * admin product form's Learning Goals picker, and /shop/goal/[goal] listing/
 * routing. Independent of the Category/ProductCategory taxonomy: a category
 * is what a product is about, a learning goal is what a child develops from
 * it — the same book can carry several goals (e.g. "How Does a Seed Grow?"
 * is Category: Science & Nature > Plants & Seeds, but Goals: STEM Learning +
 * Early Learning). There's no dedicated LearningGoal DB table — this static
 * list is the deliberately lightweight source (same pattern the codebase
 * already uses for e.g. age ranges), so a plain array here is the smallest
 * change that supports rich homepage cards without introducing an unused
 * admin CRUD surface for a 8-item, rarely-changed list.
 */
export const learningGoals = [
  {
    slug: "early-learning",
    label: "Early Learning",
    description: "Build essential early skills through playful learning, practice and exploration.",
    imageAlt: "Colourful stacking rings and alphabet blocks representing early learning",
    icon: GraduationCap,
    image: "/images/goal-early-learning.png",
    cardBg: "bg-sage-50",
    iconBg: "bg-sage-500",
    titleColor: "text-sage-800",
  },
  {
    slug: "islamic-studies",
    label: "Islamic Studies",
    description: "Explore Islam through age-appropriate books, lessons and activities.",
    imageAlt: "An Islamic arch, crescent and lantern representing Islamic Studies",
    icon: Moon,
    image: "/images/goal-islamic-studies.png",
    cardBg: "bg-lemon-50",
    iconBg: "bg-lemon-600",
    titleColor: "text-ink-700",
  },
  {
    slug: "stem-learning",
    label: "STEM Learning",
    description: "Explore science, mathematics, nature and how the world works.",
    imageAlt: "A rocket representing STEM learning",
    icon: Rocket,
    image: "/images/goal-stem-learning.png",
    cardBg: "bg-ink-50",
    iconBg: "bg-ink-500",
    titleColor: "text-ink-700",
  },
  {
    slug: "quran-arabic",
    label: "Qur'an & Arabic",
    description: "Build a love for the Qur'an and develop foundational Arabic skills.",
    imageAlt: "A Qur'an on a wooden stand representing Qur'an and Arabic learning",
    icon: BookOpen,
    image: "/images/goal-quran-arabic.png",
    cardBg: "bg-teal-50",
    iconBg: "bg-teal-500",
    titleColor: "text-teal-800",
  },
  {
    slug: "character-building",
    label: "Character Building",
    description: "Build good manners, values, habits and positive character.",
    imageAlt: "A heart and stacked books representing character building",
    icon: Heart,
    image: "/images/goal-character-building.png",
    cardBg: "bg-blossom-50",
    iconBg: "bg-blossom-500",
    titleColor: "text-blossom-700",
  },
  {
    slug: "islamic-stories",
    label: "Islamic Stories",
    description: "Discover beneficial stories from Islam and the lives of righteous people.",
    imageAlt: "A storybook and lantern representing Islamic stories",
    icon: Feather,
    image: "/images/goal-islamic-stories.png",
    cardBg: "bg-sunny-50",
    iconBg: "bg-sunny-500",
    titleColor: "text-sunny-800",
  },
  {
    slug: "creative-arts",
    label: "Creative Arts",
    description: "Create, colour and explore through hands-on creative activities.",
    imageAlt: "Crayons and a paint palette representing creative arts",
    icon: Palette,
    image: "/images/goal-creative-arts.png",
    cardBg: "bg-sage-50",
    iconBg: "bg-sage-600",
    titleColor: "text-sage-800",
  },
  {
    slug: "life-skills",
    label: "Life Skills",
    description: "Develop practical skills for everyday life, confidence and independence.",
    imageAlt: "A plant pot and everyday objects representing life skills",
    icon: Lightbulb,
    image: "/images/goal-life-skills.png",
    cardBg: "bg-lemon-50",
    iconBg: "bg-lemon-500",
    titleColor: "text-lemon-800",
  },
] as const satisfies {
  slug: string;
  label: string;
  description: string;
  imageAlt: string;
  icon: LucideIcon;
  image: string;
  cardBg: string;
  iconBg: string;
  titleColor: string;
}[];

export type LearningGoalSlug = (typeof learningGoals)[number]["slug"];

export function getLearningGoalBySlug(slug: string) {
  return learningGoals.find((goal) => goal.slug === slug);
}
