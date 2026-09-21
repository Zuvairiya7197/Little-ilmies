import {
  BookOpen,
  Landmark,
  Star,
  Palette,
  Languages,
  Heart,
  PenTool,
  Calculator,
  Baby,
  Gamepad2,
  Leaf,
  Utensils,
  ShieldCheck,
  Wrench,
  BookHeart,
  type LucideIcon,
} from "lucide-react";

/** Small lucide-icon stand-in for each real category slug — used wherever a
 * category needs a compact visual identity (filter checkboxes, chips) but a
 * full cover-image thumbnail would be too heavy. Falls back to BookOpen. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Islamic Studies
  "islamic-studies": Landmark,
  aqeedah: Landmark,
  tawheed: Landmark,
  "names-of-allah": Star,
  "stories-of-the-prophets": Landmark,
  "stories-from-the-quran": BookOpen,
  "good-manners": Heart,
  "duas-and-adhkar": Heart,
  salah: Landmark,
  ramadan: Star,
  eid: Star,
  "daily-sunnah": Heart,
  // Qur'an & Arabic
  "quran-and-arabic": BookOpen,
  "arabic-alphabet": Languages,
  "arabic-reading": Languages,
  "arabic-writing": Languages,
  tajweed: BookOpen,
  "quran-reading": BookOpen,
  memorization: BookOpen,
  // Early Learning
  "early-learning": Baby,
  "alphabet-and-phonics": Baby,
  "numbers-and-counting-early": Calculator,
  "shapes-and-colours": Palette,
  "pre-writing-and-tracing": PenTool,
  "preschool-skills": Baby,
  // Mathematics
  mathematics: Calculator,
  "numbers-and-counting-math": Calculator,
  "shapes-and-geometry": Calculator,
  measurement: Calculator,
  patterns: Calculator,
  "logic-and-problem-solving": Calculator,
  // Science & Nature
  "science-and-nature": Leaf,
  "plants-and-seeds": Leaf,
  "animals-and-insects": Leaf,
  "weather-and-seasons": Leaf,
  "earth-and-environment": Leaf,
  "space-and-astronomy": Star,
  "nature-and-creation": Leaf,
  // Life Skills
  "life-skills": ShieldCheck,
  "healthy-living": Heart,
  "food-and-nutrition": Utensils,
  "cooking-for-kids": Utensils,
  "safety-and-awareness": ShieldCheck,
  "practical-skills": Wrench,
  // Activities & Printables
  "activities-and-printables": PenTool,
  worksheets: PenTool,
  "coloring-books": Palette,
  "activity-books": BookOpen,
  flashcards: BookOpen,
  crafts: Palette,
  posters: PenTool,
  games: Gamepad2,
  puzzles: Gamepad2,
  // Stories & Reading
  "stories-and-reading": BookHeart,
  "islamic-stories": BookHeart,
  "educational-stories": BookOpen,
  "moral-stories": BookHeart,
  "beginner-readers": BookOpen,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}
