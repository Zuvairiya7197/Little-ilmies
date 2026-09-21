import type { Category } from "@/types/catalog";

export const shopNavLinks = [
  { label: "Bundles", href: "/shop?bundle=all" },
  { label: "Printables", href: "/shop/activities-and-printables" },
  { label: "Best Sellers", href: "/shop?sort=bestselling" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

export const quickCategoryLinks = [
  { label: "Ramadan", href: "/shop/ramadan" },
  { label: "Stories of the Prophets", href: "/shop/stories-of-the-prophets" },
  { label: "Duas", href: "/shop/duas-and-adhkar" },
  { label: "Qur'an & Arabic", href: "/shop/quran-and-arabic" },
  { label: "Printables", href: "/shop/activities-and-printables" },
  { label: "Best Sellers", href: "/shop?sort=bestselling" },
  { label: "New", href: "/shop?sort=newest" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

export const booksMenuSections = [
  {
    title: "Islamic Studies",
    href: "/shop/islamic-studies",
    links: [
      { label: "Aqeedah", href: "/shop/aqeedah" },
      { label: "Tawheed", href: "/shop/tawheed" },
      { label: "Stories of the Prophets", href: "/shop/stories-of-the-prophets" },
      { label: "Stories from the Qur'an", href: "/shop/stories-from-the-quran" },
      { label: "Sahabah", href: "/shop/sahabah" },
      { label: "Mothers of the Believers", href: "/shop/mothers-of-the-believers" },
      { label: "Good Manners", href: "/shop/good-manners" },
      { label: "Duas & Adhkar", href: "/shop/duas-and-adhkar" },
      { label: "Salah", href: "/shop/salah" },
      { label: "Ramadan", href: "/shop/ramadan" },
      { label: "Eid", href: "/shop/eid" },
      { label: "Hajj & Umrah", href: "/shop/hajj-and-umrah" },
      { label: "Daily Sunnah", href: "/shop/daily-sunnah" },
    ],
  },
  {
    title: "Qur'an & Arabic",
    href: "/shop/quran-and-arabic",
    links: [
      { label: "Arabic Alphabet", href: "/shop/arabic-alphabet" },
      { label: "Arabic Reading", href: "/shop/arabic-reading" },
      { label: "Arabic Writing", href: "/shop/arabic-writing" },
      { label: "Tajweed", href: "/shop/tajweed" },
      { label: "Qur'an Reading", href: "/shop/quran-reading" },
      { label: "Memorization", href: "/shop/memorization" },
      { label: "Asma-ul-Husna", href: "/shop/asma-ul-husna" },
    ],
  },
  {
    title: "Educational",
    href: "/shop/educational",
    links: [
      { label: "Early Learning", href: "/shop/early-learning" },
      { label: "English", href: "/shop/english" },
      { label: "Mathematics", href: "/shop/mathematics" },
      { label: "Science", href: "/shop/science" },
      { label: "Social Studies", href: "/shop/social-studies" },
      { label: "STEM", href: "/shop/stem" },
      { label: "Languages", href: "/shop/languages" },
    ],
  },
  {
    title: "Activities & Printables",
    href: "/shop/activities-and-printables",
    links: [
      { label: "Worksheets", href: "/shop/worksheets" },
      { label: "Coloring Books", href: "/shop/coloring-books" },
      { label: "Flashcards", href: "/shop/flashcards" },
      { label: "Crafts", href: "/shop/crafts" },
      { label: "Posters", href: "/shop/posters" },
      { label: "Activity Books", href: "/shop/activity-books" },
      { label: "Games", href: "/shop/games" },
      { label: "Puzzles", href: "/shop/puzzles" },
    ],
  },
  {
    title: "Shop by Age",
    href: "/shop/shop-by-age",
    links: [
      { label: "0-3 Years", href: "/shop/0-3-years" },
      { label: "3-6 Years", href: "/shop/3-6-years" },
      { label: "6-9 Years", href: "/shop/6-9-years" },
      { label: "9-12 Years", href: "/shop/9-12-years" },
      { label: "12+ Years", href: "/shop/12-plus-years" },
    ],
  },
] as const;

export interface BooksMenuSection {
  title: string;
  href: string;
  links: readonly { label: string; href: string }[];
}

const CURATED_CATEGORY_SLUGS = new Set(
  booksMenuSections.flatMap((section) =>
    section.links
      .map((link) => link.href.match(/^\/shop\/([^?/#]+)/)?.[1])
      .filter((slug): slug is string => Boolean(slug))
  )
);

/**
 * Merges the curated, hand-tuned booksMenuSections above with any live
 * category the admin has created that isn't already covered by one of
 * those curated links — so a brand-new admin-created category shows up in
 * the mega menu / mobile menu / filter panel immediately, with no code
 * change or deploy needed. Existing curated sections and hrefs are
 * returned completely untouched (same slugs/URLs as before); new
 * categories are appended as their own trailing "More Categories" section.
 *
 * "Shop by Age" and category-group slugs (islamic-books/educational-books/
 * gifts-games, from data/category-groups.ts) are deliberately excluded —
 * this menu is about individual categories, not the age taxonomy or the
 * top-level groupings.
 */
export function getBooksMenuSections(categories: Pick<Category, "slug" | "name">[]): BooksMenuSection[] {
  const uncovered = categories.filter((category) => !CURATED_CATEGORY_SLUGS.has(category.slug));
  if (uncovered.length === 0) return [...booksMenuSections];

  return [
    ...booksMenuSections,
    {
      title: "More Categories",
      href: "/shop",
      links: uncovered.map((category) => ({ label: category.name, href: `/shop/${category.slug}` })),
    },
  ];
}
