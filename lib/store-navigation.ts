export const shopNavLinks = [
  { label: "Bundles", href: "/shop?bundle=all" },
  { label: "Printables", href: "/shop/printables" },
  { label: "Best Sellers", href: "/shop?sort=bestselling" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

export const quickCategoryLinks = [
  { label: "Ramadan", href: "/shop/seasonal-collections" },
  { label: "Stories of the Prophets", href: "/shop/islamic-studies" },
  { label: "Duas", href: "/shop/islamic-studies" },
  { label: "Qur'an & Arabic", href: "/shop/quran-and-arabic" },
  { label: "Printables", href: "/shop/printables" },
  { label: "Best Sellers", href: "/shop?sort=bestselling" },
  { label: "New", href: "/shop?sort=newest" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

export const booksMenuSections = [
  {
    title: "Islamic Studies",
    href: "/shop/islamic-studies",
    links: [
      "Aqeedah",
      "Tawheed",
      "Stories of the Prophets",
      "Stories from the Qur'an",
      "Sahabah",
      "Mothers of the Believers",
      "Good Manners",
      "Duas & Adhkar",
      "Salah",
      "Ramadan",
      "Eid",
      "Hajj & Umrah",
      "Daily Sunnah",
    ].map((label) => ({ label, href: "/shop/islamic-studies" })),
  },
  {
    title: "Qur'an & Arabic",
    href: "/shop/quran-and-arabic",
    links: [
      "Arabic Alphabet",
      "Arabic Reading",
      "Arabic Writing",
      "Tajweed",
      "Qur'an Reading",
      "Memorization",
      "Asma-ul-Husna",
    ].map((label) => ({ label, href: "/shop/quran-and-arabic" })),
  },
  {
    title: "Educational",
    href: "/shop/educational-books",
    links: [
      { label: "Early Learning", href: "/shop/early-learning" },
      { label: "English", href: "/shop/languages" },
      { label: "Mathematics", href: "/shop/mathematics" },
      { label: "Science", href: "/shop/science-and-stem" },
      { label: "Social Studies", href: "/shop/educational-books" },
      { label: "STEM", href: "/shop/science-and-stem" },
      { label: "Languages", href: "/shop/languages" },
    ],
  },
  {
    title: "Activities & Printables",
    href: "/shop/printables",
    links: [
      { label: "Worksheets", href: "/shop/printables" },
      { label: "Coloring Books", href: "/shop/creative-learning" },
      { label: "Flashcards", href: "/shop/printables" },
      { label: "Crafts", href: "/shop/creative-learning" },
      { label: "Posters", href: "/shop/printables" },
      { label: "Activity Books", href: "/shop/games-and-activities" },
      { label: "Games", href: "/shop/games-and-activities" },
      { label: "Puzzles", href: "/shop/games-and-activities" },
    ],
  },
  {
    title: "Shop by Age",
    href: "/shop",
    links: [
      { label: "0-3 Years", href: "/shop?age=0-3" },
      { label: "3-6 Years", href: "/shop?age=3-6" },
      { label: "6-9 Years", href: "/shop?age=6-9" },
      { label: "9-12 Years", href: "/shop?age=9-12" },
      { label: "12+ Years", href: "/shop?age=12%2B" },
    ],
  },
] as const;
