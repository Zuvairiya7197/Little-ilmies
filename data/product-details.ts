import type { ProductDetail, ProductReview } from "@/types/catalog";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";

type DetailExtra = Pick<
  ProductDetail,
  "description" | "whatsInside" | "learningBenefits" | "bestFor" | "previewImages" | "reviews"
>;

const sampleReviews = (names: [string, string, string]): ProductReview[] => [
  {
    id: "rev_1",
    author: names[0],
    rating: 5,
    date: "2026-05-12",
    title: "My kids ask for this every night",
    body: "The illustrations are gorgeous and the language is simple enough for my 5-year-old to follow along. Printed a copy for our homeschool binder too.",
  },
  {
    id: "rev_2",
    author: names[1],
    rating: 5,
    date: "2026-04-02",
    title: "Beautifully done and authentic",
    body: "I appreciated that the stories are sourced carefully. Great addition to our home library, and the instant download meant we started reading the same evening.",
  },
  {
    id: "rev_3",
    author: names[2],
    rating: 4,
    date: "2026-02-19",
    title: "Lovely, would love a sequel",
    body: "Really well made. Only wish it was a bit longer — my daughter finished it in two sittings and wants more.",
  },
];

const detailExtras: Record<string, DetailExtra> = {
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
    reviews: sampleReviews(["Amina K.", "Yusuf R.", "Fatima S."]),
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
    reviews: sampleReviews(["Layla M.", "Ibrahim T.", "Zainab A."]),
  },
};

const defaultExtra = (title: string): DetailExtra => ({
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
  reviews: sampleReviews(["Sara N.", "Ahmed B.", "Maryam H."]),
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
