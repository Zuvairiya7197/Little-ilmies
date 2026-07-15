import type { ProductDetail } from "@/types/catalog";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";

export type DetailExtra = Pick<
  ProductDetail,
  "description" | "whatsInside" | "learningBenefits" | "bestFor" | "previewImages" | "reviews"
>;

// No reviews are seeded — there are no real customer reviews yet. Every
// product starts with an empty review list; real reviews should only ever
// come from actual buyers (see the reviews table in prisma/schema.prisma).
export const detailExtras: Record<string, DetailExtra> = {
  "asma-ul-husna-99-names-of-allah": {
    description:
      "Asma Ul-Husna introduces children to the 99 Names of Allah through gentle illustrations, simple meanings, and memorable rhymes. Each spread pairs a Name with a short reflection children can carry into daily life.",
    whatsInside: [
      "All 99 Names of Allah with transliteration and meaning",
      "Full-colour illustrated spreads",
      "Simple reflection questions for each Name",
      "A printable memorisation tracker",
    ],
    learningBenefits: [
      "Builds early tawheed vocabulary",
      "Encourages daily reflection and gratitude",
      "Supports memorisation through repetition and colour",
    ],
    bestFor: ["Ages 6-9", "Homeschool circle time", "Bedtime reading", "Madrasa memorisation programs"],
    previewImages: [
      "/images/previews/stories-of-the-prophets-1.svg",
      "/images/previews/stories-of-the-prophets-2.svg",
      "/images/previews/stories-of-the-prophets-3.svg",
    ],
    reviews: [],
  },
  "stories-of-the-prophets": {
    description:
      "A gentle, authentic retelling of the lives of the Prophets, written in language young children can understand and treasure. Each chapter closes with a simple lesson parents can discuss together.",
    whatsInside: [
      "12 illustrated chapters covering major Prophets",
      "Discussion questions after each story",
      "Glossary of Islamic terms for parents",
      "Printable colouring pages inspired by each story",
    ],
    learningBenefits: [
      "Introduces the seerah of the Prophets in age-appropriate language",
      "Strengthens Islamic identity from an early age",
      "Encourages family discussion and reflection",
    ],
    bestFor: ["Ages 6-9", "Family read-aloud time", "Weekend Islamic school", "Gifting for Eid"],
    previewImages: [
      "/images/previews/stories-of-the-prophets-1.svg",
      "/images/previews/stories-of-the-prophets-2.svg",
      "/images/previews/stories-of-the-prophets-3.svg",
    ],
    reviews: [],
  },
};

export const defaultExtra = (title: string): DetailExtra => ({
  description: `${title} is a beautifully illustrated, authentically sourced e-book crafted for young Muslim learners. Designed with a warm, child-friendly tone, it's ready to read on screen or print at home.`,
  whatsInside: [
    "Full-colour illustrated pages",
    "Simple, age-appropriate language",
    "Printable at home in standard letter or A4 size",
    "Instant PDF download after purchase",
  ],
  learningBenefits: [
    "Builds reading confidence and vocabulary",
    "Encourages independent and family reading time",
    "Reinforces core Islamic and educational concepts",
  ],
  bestFor: ["Home learning", "Madrasa & weekend school", "Homeschooling families", "Gifting"],
  previewImages: [
    "/images/previews/stories-of-the-prophets-1.svg",
    "/images/previews/stories-of-the-prophets-2.svg",
    "/images/previews/stories-of-the-prophets-3.svg",
  ],
  reviews: [],
});

export function getProductDetailBySlug(slug: string): ProductDetail | undefined {
  const product = getProductBySlug(slug);
  if (!product) return undefined;

  const extra = detailExtras[slug] ?? defaultExtra(product.title);
  const related = getRelatedProducts(product, 4);

  return {
    ...product,
    ...extra,
    relatedSlugs: related.map((p) => p.slug),
  };
}

export function getAllProductSlugs() {
  return products.map((p) => p.slug);
}
