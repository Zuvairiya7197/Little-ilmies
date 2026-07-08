import type { ProductSummary } from "@/types/catalog";
import type { RegionalPrice } from "@/types/pricing";

/**
 * Manually curated regional prices — NOT exchange-rate conversions.
 * `inr` is the home-market price; `usd` is the required international
 * default; `gbp`/`aed` are optional per-country overrides an admin can add.
 * `skipUsd` demonstrates the emergency INR fallback for a product an
 * admin hasn't priced internationally yet.
 */
function regionalPrices({
  inr,
  inrSale,
  usd,
  usdSale,
  gbp,
  aed,
  skipUsd,
}: {
  inr: number;
  inrSale?: number;
  usd?: number;
  usdSale?: number;
  gbp?: number;
  aed?: number;
  skipUsd?: boolean;
}): RegionalPrice[] {
  const prices: RegionalPrice[] = [
    { currencyCode: "INR", regularPrice: inr, salePrice: inrSale, isActive: true },
  ];

  if (!skipUsd && usd !== undefined) {
    prices.push({
      currencyCode: "USD",
      regularPrice: usd,
      salePrice: usdSale,
      isDefault: true,
      isActive: true,
    });
  }

  if (gbp !== undefined) {
    prices.push({ currencyCode: "GBP", regularPrice: gbp, isActive: true });
  }

  if (aed !== undefined) {
    prices.push({ currencyCode: "AED", regularPrice: aed, isActive: true });
  }

  return prices;
}

export const products: ProductSummary[] = [
  {
    id: "prod_asma_ul_husna",
    slug: "asma-ul-husna-99-names-of-allah",
    title: "Asma Ul-Husna: 99 Names of Allah",
    shortDescription: "A beautifully illustrated journey through the 99 Names of Allah, made memorable for young minds.",
    coverImage: "/images/products/asma-ul-husna-real.png",
    prices: regionalPrices({ inr: 39900, usd: 400, gbp: 350, aed: 1500 }),
    category: { slug: "dua-and-prayers-for-kids", name: "Du'ā' & Prayers for Kids" },
    ageRange: "6-9",
    pageCount: 48,
    language: "English",
    format: "PDF",
    rating: 4.9,
    reviewCount: 132,
    isBestseller: true,
    hasFreePreview: true,
    downloadCount: 2840,
    publishedAt: "2025-11-02",
  },
  {
    id: "prod_stories_prophets",
    slug: "stories-of-the-prophets",
    title: "Stories of the Prophets",
    shortDescription: "Authentic, gentle retellings of the Prophets' lives, crafted for curious young hearts.",
    coverImage: "/images/products/stories-of-the-prophets.svg",
    prices: regionalPrices({ inr: 49900, usd: 500, gbp: 400, aed: 1800 }),
    category: { slug: "stories-of-the-prophets", name: "Stories of the Prophets" },
    ageRange: "6-9",
    pageCount: 64,
    language: "English",
    format: "Printable PDF",
    rating: 5,
    reviewCount: 210,
    isBestseller: true,
    hasFreePreview: true,
    downloadCount: 4120,
    publishedAt: "2025-08-14",
  },
  {
    id: "prod_dua_prayers",
    slug: "dua-and-prayers-for-kids",
    title: "Du'ā' & Prayers for Kids",
    shortDescription: "Everyday duas presented with warm illustrations to help children learn by heart.",
    coverImage: "/images/products/dua-and-prayers.svg",
    prices: regionalPrices({ inr: 29900, usd: 350, aed: 1300 }),
    category: { slug: "dua-and-prayers-for-kids", name: "Du'ā' & Prayers for Kids" },
    ageRange: "3-6",
    pageCount: 36,
    language: "English",
    format: "PDF",
    rating: 4.8,
    reviewCount: 98,
    isNewArrival: true,
    hasFreePreview: true,
    downloadCount: 1560,
    publishedAt: "2026-05-20",
  },
  {
    id: "prod_islamic_manners",
    slug: "islamic-manners-and-character",
    title: "Islamic Manners & Character",
    shortDescription: "Simple, story-based lessons that build everyday akhlaq at home.",
    coverImage: "/images/products/islamic-manners.svg",
    prices: regionalPrices({ inr: 34900, usd: 400 }),
    category: { slug: "islamic-manners-and-character", name: "Islamic Manners & Character" },
    ageRange: "3-6",
    pageCount: 40,
    language: "English",
    format: "PDF",
    rating: 4.7,
    reviewCount: 76,
    hasFreePreview: true,
    downloadCount: 1120,
    publishedAt: "2025-06-10",
  },
  {
    id: "prod_arabic_for_kids",
    slug: "arabic-for-kids",
    title: "Arabic for Kids",
    shortDescription: "A joyful first workbook for learning Arabic letters and simple words.",
    coverImage: "/images/products/arabic-for-kids.svg",
    prices: regionalPrices({ inr: 44900, usd: 450, gbp: 380, aed: 1650 }),
    category: { slug: "arabic-for-kids", name: "Arabic for Kids" },
    ageRange: "6-9",
    pageCount: 52,
    language: "Arabic",
    format: "Printable PDF",
    rating: 4.9,
    reviewCount: 64,
    isNewArrival: true,
    hasFreePreview: true,
    downloadCount: 980,
    publishedAt: "2026-04-02",
  },
  {
    id: "prod_english_for_kids",
    slug: "english-for-kids",
    title: "English for Kids",
    shortDescription: "Reading, writing, and phonics practice designed for young learners.",
    coverImage: "/images/products/english-for-kids.svg",
    prices: regionalPrices({ inr: 39900, usd: 400 }),
    category: { slug: "english-for-kids", name: "English for Kids" },
    ageRange: "3-6",
    pageCount: 44,
    language: "English",
    format: "Printable PDF",
    rating: 4.6,
    reviewCount: 51,
    hasFreePreview: true,
    downloadCount: 870,
    publishedAt: "2025-09-28",
  },
  {
    id: "prod_preschool_learning",
    slug: "preschool-learning-book",
    title: "Preschool Learning Book",
    shortDescription: "Letters, numbers, shapes, and colours in one delightful workbook.",
    coverImage: "/images/products/preschool-learning.svg",
    prices: regionalPrices({ inr: 34900, usd: 400, gbp: 350, aed: 1400 }),
    category: { slug: "preschool-learning", name: "Preschool Learning" },
    ageRange: "0-3",
    pageCount: 38,
    language: "English",
    format: "Printable PDF",
    rating: 4.8,
    reviewCount: 88,
    isBestseller: true,
    hasFreePreview: true,
    downloadCount: 2210,
    publishedAt: "2025-05-18",
  },
  {
    id: "prod_stories_quran",
    slug: "stories-from-the-quran",
    title: "Stories from the Qur'an",
    shortDescription: "Timeless Qur'anic lessons retold with warmth and beautiful illustration.",
    coverImage: "/images/products/stories-from-the-quran.svg",
    prices: regionalPrices({ inr: 49900, inrSale: 39900, usd: 500, usdSale: 400, gbp: 400, aed: 1800 }),
    category: { slug: "stories-from-the-quran", name: "Stories from the Qur'an" },
    ageRange: "6-9",
    pageCount: 60,
    language: "English",
    format: "PDF",
    rating: 4.9,
    reviewCount: 145,
    isBestseller: true,
    hasFreePreview: true,
    downloadCount: 3050,
    publishedAt: "2025-07-22",
  },
  {
    id: "prod_mothers_ummah",
    slug: "mothers-of-the-ummah",
    title: "Mothers of the Ummah",
    shortDescription: "The inspiring lives of the great women of Islam, told for young readers.",
    coverImage: "/images/products/mothers-of-the-ummah.svg",
    prices: regionalPrices({ inr: 44900, usd: 450, gbp: 380 }),
    category: { slug: "mothers-of-the-ummah", name: "Mothers of the Ummah" },
    ageRange: "9-12",
    pageCount: 56,
    language: "English",
    format: "PDF",
    rating: 4.9,
    reviewCount: 61,
    isNewArrival: true,
    hasFreePreview: true,
    downloadCount: 740,
    publishedAt: "2026-03-11",
  },
  {
    id: "prod_ashrah",
    slug: "ashrah-al-mubashsharah",
    title: "Ashrah Al-Mubashsharah",
    shortDescription: "Meet the ten companions promised Paradise in this gentle keepsake e-book.",
    coverImage: "/images/products/ashrah-al-mubashsharah.svg",
    // Intentionally left without a USD price to demonstrate the emergency
    // INR fallback + admin warning path described in the pricing spec.
    prices: regionalPrices({ inr: 44900, skipUsd: true }),
    category: { slug: "ashrah-al-mubashsharah", name: "Ashrah Al-Mubashsharah" },
    ageRange: "9-12",
    pageCount: 50,
    language: "English",
    format: "PDF",
    rating: 4.8,
    reviewCount: 39,
    hasFreePreview: true,
    downloadCount: 510,
    publishedAt: "2025-04-06",
  },
  {
    id: "prod_fruits_coloring",
    slug: "fruits-colouring-book",
    title: "Fruits Colouring Book",
    shortDescription: "Bright, printable colouring pages inspired by the fruits of the Qur'an.",
    coverImage: "/images/products/fruits-colouring-book-real.jpg",
    prices: regionalPrices({ inr: 19900, usd: 250 }),
    category: { slug: "coloring-books", name: "Coloring Books" },
    ageRange: "0-3",
    pageCount: 24,
    language: "English",
    format: "Printable PDF",
    rating: 4.7,
    reviewCount: 45,
    hasFreePreview: true,
    downloadCount: 1330,
    publishedAt: "2025-03-15",
  },
  {
    id: "prod_floral_planner",
    slug: "floral-jar-2026-printable-diy-desk-calendar",
    title: "Floral Jar 2026 Printable DIY Desk Calendar",
    shortDescription: "A charming printable desk calendar to organise the whole year at home.",
    coverImage: "/images/products/floral-jar-calendar-real.jpg",
    prices: regionalPrices({ inr: 24900, usd: 300 }),
    category: { slug: "games-and-gifts", name: "Games & Gifts" },
    ageRange: "9-12",
    pageCount: 14,
    language: "English",
    format: "Printable PDF",
    rating: 4.6,
    reviewCount: 22,
    isNewArrival: true,
    hasFreePreview: false,
    downloadCount: 390,
    publishedAt: "2026-06-01",
  },
  {
    id: "prod_stationary_planner",
    slug: "stationary-jar-2026-printable-diy-desk-calendar",
    title: "Stationary Jar 2026 Printable DIY Desk Calendar",
    shortDescription: "A playful stationery-themed printable calendar for the new year.",
    coverImage: "/images/products/stationary-jar-calendar-real.jpg",
    prices: regionalPrices({ inr: 24900, usd: 300 }),
    category: { slug: "games-and-gifts", name: "Games & Gifts" },
    ageRange: "9-12",
    pageCount: 14,
    language: "English",
    format: "Printable PDF",
    rating: 4.5,
    reviewCount: 17,
    isNewArrival: true,
    hasFreePreview: false,
    downloadCount: 260,
    publishedAt: "2026-06-01",
  },
  {
    id: "prod_math_for_kids",
    slug: "math-for-kids",
    title: "Math for Kids",
    shortDescription: "Friendly number practice that builds confidence one page at a time.",
    coverImage: "/images/products/preschool-learning.svg",
    prices: regionalPrices({ inr: 34900, usd: 400 }),
    category: { slug: "math-for-kids", name: "Math for Kids" },
    ageRange: "3-6",
    pageCount: 42,
    language: "English",
    format: "Printable PDF",
    rating: 4.6,
    reviewCount: 33,
    hasFreePreview: true,
    downloadCount: 610,
    publishedAt: "2025-10-09",
  },
  {
    id: "prod_marathi_for_kids",
    slug: "marathi-for-kids",
    title: "Marathi for Kids",
    shortDescription: "A gentle first workbook for reading and writing Marathi.",
    coverImage: "/images/products/english-for-kids.svg",
    prices: regionalPrices({ inr: 34900, usd: 400 }),
    category: { slug: "marathi-for-kids", name: "Marathi for Kids" },
    ageRange: "6-9",
    pageCount: 40,
    language: "Marathi",
    format: "Printable PDF",
    rating: 4.5,
    reviewCount: 12,
    hasFreePreview: true,
    downloadCount: 180,
    publishedAt: "2026-01-20",
  },
  {
    id: "prod_hindi_for_kids",
    slug: "hindi-for-kids",
    title: "Hindi for Kids",
    shortDescription: "Letters, words, and short stories for young Hindi learners.",
    coverImage: "/images/products/english-for-kids.svg",
    prices: regionalPrices({ inr: 34900, usd: 400 }),
    category: { slug: "hindi-for-kids", name: "Hindi for Kids" },
    ageRange: "6-9",
    pageCount: 40,
    language: "Hindi",
    format: "Printable PDF",
    rating: 4.6,
    reviewCount: 14,
    hasFreePreview: true,
    downloadCount: 205,
    publishedAt: "2026-01-20",
  },
];

export function getFeaturedProducts(limit = 8) {
  return products.slice(0, limit);
}

export function getBestsellers(limit = 8) {
  return products.filter((p) => p.isBestseller).slice(0, limit);
}

export function getNewArrivals(limit = 8) {
  return products.filter((p) => p.isNewArrival).slice(0, limit);
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: ProductSummary, limit = 4) {
  return products
    .filter((p) => p.id !== product.id && p.category.slug === product.category.slug)
    .slice(0, limit);
}
