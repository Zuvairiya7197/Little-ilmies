export interface BundleSeed {
  slug: string;
  name: string;
  description: string;
  productSlugs: string[];
  bundlePriceInr: number;
  bundlePriceUsd: number;
}

/**
 * Curated launch bundles — priced below the sum of their member products'
 * regular INR/USD prices so the homepage savings badge is genuine, not
 * inflated.
 */
export const bundles: BundleSeed[] = [
  {
    slug: "ramadan-bundle",
    name: "Ramadan Bundle",
    description: "Duas, manners, and Qur'an stories to build a meaningful Ramadan routine together.",
    productSlugs: ["dua-and-prayers-for-kids", "islamic-manners-and-character", "stories-from-the-quran"],
    bundlePriceInr: 89900,
    bundlePriceUsd: 900,
  },
  {
    slug: "prophets-bundle",
    name: "Prophets Bundle",
    description: "The lives of the Prophets and the great women of Islam, told gently for young hearts.",
    productSlugs: ["stories-of-the-prophets", "mothers-of-the-ummah", "ashrah-al-mubashsharah"],
    bundlePriceInr: 99900,
    bundlePriceUsd: 1000,
  },
  {
    slug: "good-manners-bundle",
    name: "Good Manners Bundle",
    description: "Building akhlaq and everyday duas into one gentle learning habit.",
    productSlugs: ["islamic-manners-and-character", "dua-and-prayers-for-kids", "asma-ul-husna-99-names-of-allah"],
    bundlePriceInr: 89900,
    bundlePriceUsd: 900,
  },
  {
    slug: "arabic-learning-bundle",
    name: "Arabic Learning Bundle",
    description: "First steps in Arabic alongside preschool foundations and English practice.",
    productSlugs: ["arabic-for-kids", "preschool-learning-book", "english-for-kids"],
    bundlePriceInr: 79900,
    bundlePriceUsd: 800,
  },
];
