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
  "arabic-for-kids": Languages,
  "ashrah-al-mubashsharah": Star,
  "coloring-books": Palette,
  "dua-and-prayers-for-kids": HandHeart,
  "english-for-kids": BookOpen,
  "games-and-gifts": Gamepad2,
  "hindi-for-kids": BookOpen,
  "islamic-manners-and-character": Heart,
  "kids-islamic-activity-books": PenTool,
  "marathi-for-kids": BookOpen,
  "math-for-kids": Calculator,
  "mothers-of-the-ummah": Star,
  "preschool-learning": Baby,
  "stories-from-the-quran": BookOpen,
  "stories-of-the-prophets": Landmark,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}
