import type { Metadata } from "next";
import { HeroSection } from "@/components/store/home/hero-section";
import { HeroCategoryStrip } from "@/components/store/home/hero-category-strip";
import { FeaturedCollections } from "@/components/store/home/featured-collections";
import { BestSellers } from "@/components/store/home/best-sellers";
import { NewArrivals } from "@/components/store/home/new-arrivals";
import { ShopByLearningGoal } from "@/components/store/home/shop-by-learning-goal";
import { ShopByAge } from "@/components/store/home/shop-by-age";
import { BundleCollections } from "@/components/store/home/bundle-collections";
import { RentAndReadHighlight } from "@/components/store/home/rent-and-read-highlight";
import { RecommendedBooks } from "@/components/store/home/recommended-books";
import { BookPreviewShowcase } from "@/components/store/home/book-preview-showcase";
import { WhyParentsChoose } from "@/components/store/home/why-parents-choose";
import { ExploreMore } from "@/components/store/home/explore-more";
import { ParentCta } from "@/components/store/home/parent-cta";
import {
  getActiveBundles,
  getHomepageSampleProduct,
  getPublishedProducts,
} from "@/lib/db/catalog";
import { Reveal } from "@/components/ui/reveal";
import { isRentalEligibleFromHeaders } from "@/lib/rentals/eligibility";

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
  const [products, bundles, homepageSample, rentalEligible] = await Promise.all(
    [
      getPublishedProducts(),
      getActiveBundles(),
      getHomepageSampleProduct(),
      isRentalEligibleFromHeaders(),
    ],
  );

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
        <BookPreviewShowcase product={homepageSample} />
      </Reveal>
      <Reveal>
        <ShopByAge />
      </Reveal>
      {rentalEligible && (
        <Reveal>
          <RentAndReadHighlight />
        </Reveal>
      )}
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
