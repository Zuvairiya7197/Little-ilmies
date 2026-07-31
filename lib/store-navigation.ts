export const shopNavLinks = [
  { label: "Bundles", href: "/shop?bundle=all" },
  { label: "Printables", href: "/shop/printables" },
  { label: "Best Sellers", href: "/shop?sort=bestselling" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

export const quickCategoryLinks = [
  { label: "Ramadan", href: "/shop/ramadan" },
  { label: "Stories of the Prophets", href: "/shop/stories-of-the-prophets" },
  { label: "Duas", href: "/shop/duas-and-adhkar" },
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
    href: "/shop/educational-books",
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
    href: "/shop/printables",
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
