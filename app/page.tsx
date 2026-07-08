import type { Metadata } from "next";
import { HeroSection } from "@/components/store/home/hero-section";
import { TrustBadges } from "@/components/store/home/trust-badges";
import { FeaturedCategories } from "@/components/store/home/featured-categories";
import { FeaturedBooks } from "@/components/store/home/featured-books";
import { WhyTrustSection } from "@/components/store/home/why-trust-section";
import { BookPreviewShowcase } from "@/components/store/home/book-preview-showcase";
import { BestsellersSection } from "@/components/store/home/bestsellers-section";
import { ParentCta } from "@/components/store/home/parent-cta";

export const metadata: Metadata = {
  title: "Islamic & Educational E-Books for Young Hearts",
  description:
    "Browse authentic Islamic and educational e-books for children. Instant PDF downloads, printable at home, and designed for Muslim families.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <FeaturedCategories />
      <FeaturedBooks />
      <WhyTrustSection />
      <BookPreviewShowcase />
      <BestsellersSection />
      <ParentCta />
    </>
  );
}
