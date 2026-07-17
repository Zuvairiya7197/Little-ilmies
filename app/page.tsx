import type { Metadata } from "next";
import { HeroSection } from "@/components/store/home/hero-section";
import { HeroCategoryStrip } from "@/components/store/home/hero-category-strip";
import { FeaturedCollections } from "@/components/store/home/featured-collections";
import { BestSellers } from "@/components/store/home/best-sellers";
import { NewArrivals } from "@/components/store/home/new-arrivals";
import { ShopByLearningGoal } from "@/components/store/home/shop-by-learning-goal";
import { ShopByAge } from "@/components/store/home/shop-by-age";
import { BundleCollections } from "@/components/store/home/bundle-collections";
import { RecommendedBooks } from "@/components/store/home/recommended-books";
import { WhyParentsChoose } from "@/components/store/home/why-parents-choose";
import { ExploreMore } from "@/components/store/home/explore-more";
import { ParentCta } from "@/components/store/home/parent-cta";
import { getActiveBundles, getPublishedProducts } from "@/lib/db/catalog";
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
  const [products, bundles] = await Promise.all([
    getPublishedProducts(),
    getActiveBundles(),
  ]);

  return (
    <>
      <HeroSection products={products} />
      <HeroCategoryStrip />
      <Reveal>
        <FeaturedCollections />
      </Reveal>
      <Reveal>
        <BestSellers products={products} />
      </Reveal>
      <Reveal>
        <NewArrivals products={products} />
      </Reveal>
      <Reveal>
        <ShopByLearningGoal />
      </Reveal>
      <Reveal>
        <ShopByAge />
      </Reveal>
      {bundles.length > 0 && (
        <Reveal>
          <BundleCollections bundles={bundles} />
        </Reveal>
      )}
      <Reveal>
        <RecommendedBooks products={products} />
      </Reveal>
      <Reveal>
        <WhyParentsChoose />
      </Reveal>
      <Reveal>
        <ExploreMore />
      </Reveal>
      <Reveal>
        <ParentCta />
      </Reveal>
    </>
  );
}
