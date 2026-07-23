import {
  BookOpen,
  Landmark,
  Star,
  Palette,
  HandHeart,
  Languages,
  Heart,
  PenTool,
  Calculator,
  Baby,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

/** Small lucide-icon stand-in for each real category slug — used wherever a
 * category needs a compact visual identity (filter checkboxes, chips) but a
 * full cover-image thumbnail would be too heavy. Falls back to BookOpen. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "best-sellers": Star,
  "bundles": BookOpen,
  "character-building": Heart,
  "creative-learning": Palette,
  "early-learning": Baby,
  "free-downloads": BookOpen,
  "games-and-activities": Gamepad2,
  "islamic-studies": Landmark,
  "languages": Languages,
  "life-skills": HandHeart,
  "mathematics": Calculator,
  "new-arrivals": Star,
  "printables": PenTool,
  "quran-and-arabic": BookOpen,
  "science-and-stem": BookOpen,
  "seasonal-collections": Star,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}
