import type { Metadata } from "next";
import { HeroSection } from "@/components/store/home/hero-section";
import { TrustBadges } from "@/components/store/home/trust-badges";
import { FeaturedCategories } from "@/components/store/home/featured-categories";
import { FeaturedBooks } from "@/components/store/home/featured-books";
import { WhyTrustSection } from "@/components/store/home/why-trust-section";
import { BookPreviewShowcase } from "@/components/store/home/book-preview-showcase";
import { BestsellersSection } from "@/components/store/home/bestsellers-section";
import { ParentCta } from "@/components/store/home/parent-cta";
import { getAllCategories, getPublishedProducts } from "@/lib/db/catalog";
import { Reveal } from "@/components/ui/reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Islamic & Educational E-Books for Young Hearts",
  description:
    "Browse authentic Islamic and educational e-books for children. Instant PDF downloads, printable at home, and designed for Muslim families.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([getPublishedProducts(), getAllCategories()]);

  return (
    <>
      <HeroSection />
      <Reveal>
        <TrustBadges />
      </Reveal>
      <Reveal>
        <FeaturedCategories categories={categories} />
      </Reveal>
      <Reveal>
        <FeaturedBooks products={products} />
      </Reveal>
      <Reveal>
        <WhyTrustSection />
      </Reveal>
      <Reveal>
        <BookPreviewShowcase />
      </Reveal>
      <Reveal>
        <BestsellersSection products={products} />
      </Reveal>
      <Reveal>
        <ParentCta />
      </Reveal>
    </>
  );
}
