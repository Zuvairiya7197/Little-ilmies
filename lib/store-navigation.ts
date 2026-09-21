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

export interface BooksMenuSection {
  title: string;
  href: string;
  links: readonly { label: string; href: string }[];
}

/**
 * Builds the "Books" mega menu / mobile menu / filter panel sections
 * straight from the DB category hierarchy: each top-level category
 * (parentId === null) becomes a section, and its children become that
 * section's links. Replaces the old hand-curated `booksMenuSections`
 * array + "uncovered categories" merge — the new taxonomy's 8
 * parent/50 child structure IS the menu now, so a category an admin adds
 * under an existing parent shows up automatically with no code change.
 *
 * Consumers (books-mega-menu.tsx, mobile-menu.tsx, filter-panel.tsx) only
 * rely on the {title, href, links: {label, href}[]}[] shape returned here,
 * which is unchanged from the previous static-array implementation.
 */
export function getBooksMenuSections(
  categories: Pick<Category, "id" | "slug" | "name" | "parentId">[]
): BooksMenuSection[] {
  const parents = categories
    .filter((c) => !c.parentId)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const childrenByParentId = new Map<string, typeof categories>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const list = childrenByParentId.get(category.parentId) ?? [];
    list.push(category);
    childrenByParentId.set(category.parentId, list);
  }
  for (const list of childrenByParentId.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return parents
    .map((parent) => ({
      title: parent.name,
      href: `/shop/${parent.slug}`,
      links: (childrenByParentId.get(parent.id) ?? []).map((child) => ({
        label: child.name,
        href: `/shop/${child.slug}`,
      })),
    }))
    .filter((section) => section.links.length > 0);
}
