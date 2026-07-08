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
    categorySlugs: [
      "stories-of-the-prophets",
      "mothers-of-the-ummah",
      "ashrah-al-mubashsharah",
      "stories-from-the-quran",
      "dua-and-prayers-for-kids",
      "islamic-manners-and-character",
      "kids-islamic-activity-books",
    ],
  },
  {
    slug: "educational-books",
    name: "Educational E-Books",
    description:
      "Preschool foundations, language learning, and early literacy — designed for home, madrasa, or homeschooling.",
    categorySlugs: [
      "preschool-learning",
      "coloring-books",
      "math-for-kids",
      "english-for-kids",
      "arabic-for-kids",
      "marathi-for-kids",
      "hindi-for-kids",
    ],
  },
  {
    slug: "gifts-games",
    name: "Gifts & Games",
    description: "Printable planners, calendars, and gifting favourites the whole family will love.",
    categorySlugs: ["games-and-gifts"],
  },
];

export function getCategoryGroupBySlug(slug: string) {
  return categoryGroups.find((g) => g.slug === slug);
}
