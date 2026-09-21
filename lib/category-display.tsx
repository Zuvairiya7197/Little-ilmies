import {
  BookHeart,
  Sparkles,
  Moon,
  Languages,
  PenTool,
  Heart,
  Star,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

/**
 * Allowlist of icons an admin can pick for a homepage-featured category
 * tile (Category.iconKey). Deliberately a small fixed set resolved through
 * this lookup — never a component reference or class name stored in the
 * DB — so admin input can only ever select one of these, not inject
 * arbitrary code or markup.
 */
export const FEATURED_CATEGORY_ICONS = {
  "book-heart": BookHeart,
  sparkles: Sparkles,
  moon: Moon,
  languages: Languages,
  "pen-tool": PenTool,
  heart: Heart,
  star: Star,
  "graduation-cap": GraduationCap,
} as const satisfies Record<string, LucideIcon>;

export type FeaturedCategoryIconKey = keyof typeof FEATURED_CATEGORY_ICONS;

export const FEATURED_CATEGORY_ICON_KEYS = Object.keys(
  FEATURED_CATEGORY_ICONS
) as FeaturedCategoryIconKey[];

export function getFeaturedCategoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (iconKey && iconKey in FEATURED_CATEGORY_ICONS) {
    return FEATURED_CATEGORY_ICONS[iconKey as FeaturedCategoryIconKey];
  }
  return BookHeart;
}

/**
 * Allowlist of accent-color token sets an admin can pick for a featured
 * category tile (Category.accentColor). Tailwind can't purge dynamically
 * interpolated class names, so this must be — and is — a fixed lookup
 * table of complete class strings already used elsewhere in the design
 * system, never string-built from the stored key.
 */
export const FEATURED_CATEGORY_ACCENTS = {
  ink: {
    cardBg: "bg-ink-50",
    badgeBg: "bg-ink-500",
    titleColor: "text-ink-700",
    button: "bg-ink-400 hover:bg-ink-500",
  },
  sunny: {
    cardBg: "bg-sunny-50",
    badgeBg: "bg-sunny-500",
    titleColor: "text-sunny-800",
    button: "bg-sunny-500 hover:bg-sunny-600",
  },
  teal: {
    cardBg: "bg-teal-50",
    badgeBg: "bg-teal-500",
    titleColor: "text-teal-800",
    button: "bg-teal-500 hover:bg-teal-600",
  },
  blossom: {
    cardBg: "bg-blossom-50",
    badgeBg: "bg-blossom-500",
    titleColor: "text-blossom-700",
    button: "bg-blossom-500 hover:bg-blossom-600",
  },
  sage: {
    cardBg: "bg-sage-50",
    badgeBg: "bg-sage-500",
    titleColor: "text-sage-800",
    button: "bg-sage-500 hover:bg-sage-600",
  },
  lemon: {
    cardBg: "bg-lemon-50",
    badgeBg: "bg-lemon-500",
    titleColor: "text-lemon-800",
    button: "bg-lemon-500 hover:bg-lemon-600",
  },
} as const;

export type FeaturedCategoryAccentKey = keyof typeof FEATURED_CATEGORY_ACCENTS;

export const FEATURED_CATEGORY_ACCENT_KEYS = Object.keys(
  FEATURED_CATEGORY_ACCENTS
) as FeaturedCategoryAccentKey[];

export function getFeaturedCategoryAccent(accentColor: string | null | undefined) {
  if (accentColor && accentColor in FEATURED_CATEGORY_ACCENTS) {
    return FEATURED_CATEGORY_ACCENTS[accentColor as FeaturedCategoryAccentKey];
  }
  return FEATURED_CATEGORY_ACCENTS.ink;
}
