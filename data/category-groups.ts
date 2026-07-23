export interface CategoryGroup {
  slug: string;
  name: string;
  description: string;
  categorySlugs: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    slug: "islamic-books",
    name: "Islamic E-Books",
    description:
      "Authentic stories of the Prophets, the Ummah's great women, du'as, and Islamic manners — retold for young hearts.",
    categorySlugs: ["islamic-studies", "quran-and-arabic", "character-building"],
  },
  {
    slug: "educational-books",
    name: "Educational E-Books",
    description:
      "Preschool foundations, language learning, and early literacy — designed for home, madrasa, or homeschooling.",
    categorySlugs: ["early-learning", "languages", "mathematics", "science-and-stem"],
  },
  {
    slug: "gifts-games",
    name: "Gifts & Games",
    description: "Printable planners, calendars, and gifting favourites the whole family will love.",
    categorySlugs: ["creative-learning", "printables", "games-and-activities", "seasonal-collections"],
  },
];

export function getCategoryGroupBySlug(slug: string) {
  return categoryGroups.find((g) => g.slug === slug);
}
