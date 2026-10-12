import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPublishedProductSlugs,
  getPublishedProductDetailBySlug,
  getRelatedProductsBySlug,
} from "@/lib/db/catalog";
import { BookPreviewCard } from "@/components/book-preview/book-preview-card";
import { ProductMobileHero } from "@/components/store/product-mobile-hero";
import { ProductHeader } from "@/components/store/product-header";
import { ProductFormatSelector } from "@/components/store/product-format-selector";
import { ProductMobileAbout } from "@/components/store/product-mobile-about";
import { RelatedBooks } from "@/components/store/related-books";
import { findPrice } from "@/lib/pricing/resolve-price";
import { formatName } from "@/lib/formats";
import { isRentalEligibleFromHeaders } from "@/lib/rentals/eligibility";
import { getAuthSession } from "@/lib/auth/get-session";
import { getProductEntitlementForUser } from "@/lib/db/orders";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { Reveal } from "@/components/ui/reveal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  // If the DB is unreachable at build time (e.g. first deploy before
  // DATABASE_URL is configured), skip pre-rendering rather than failing the
  // whole build — revalidate = 60 means every slug still renders correctly
  // on first request and gets cached from then on (dynamicParams defaults
  // to true).
  try {
    const slugs = await getAllPublishedProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductDetailBySlug(slug);
  if (!product) return {};
  const title = product.seoTitle || product.title;
  const description = product.seoDescription || product.shortDescription;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [{ url: product.coverImage }],
      type: "website",
    },
    keywords: product.seoKeywords,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getPublishedProductDetailBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProductsBySlug(slug, 4);
  const rentalEligible = await isRentalEligibleFromHeaders();
  const session = await getAuthSession();
  const entitlement = session?.user
    ? await getProductEntitlementForUser(session.user.id, product.id)
    : { ownedFormats: [], activeRentalExpiresAt: null };

  // One offer per purchasable PDF format, each with its own INR price.
  const offers = product.variants.flatMap((variant) => {
    const inrPrice = variant.format === "RENT_AND_READ" ? undefined : findPrice(variant, "INR");
    if (!inrPrice) return [];
    return [
      {
        "@type": "Offer",
        name: formatName(variant.format),
        price: ((inrPrice.salePrice ?? inrPrice.regularPrice) / 100).toFixed(2),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    ];
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: product.title,
    description: product.shortDescription,
    image: product.coverImage,
    bookFormat: "https://schema.org/EBook",
    inLanguage: product.language,
    numberOfPages: product.pageCount,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    ...(offers.length > 0 ? { offers } : {}),
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Shop", path: "/shop" },
    { name: product.category.name, path: `/shop/${product.category.slug}` },
    { name: product.title, path: `/product/${product.slug}` },
  ]);

  return (
    <div className="pb-24 lg:pb-16">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />

      <div className="container-content py-4 xs:py-5 lg:py-10">
        <div className="grid gap-5 sm:grid-cols-[1.45fr_1fr] sm:items-start lg:grid-cols-2 lg:gap-12">
          <ProductMobileHero product={product} />
          <div className="hidden lg:block">
            <BookPreviewCard
              title={product.title}
              coverImage={product.coverImage}
              previewImages={product.previewImages}
              productSlug={product.slug}
              pageCount={product.pageCount}
              hasFreePreview={product.hasFreePreview}
            />
          </div>

          <div className="lg:mt-0">
            <ProductHeader product={product} />

            <ProductFormatSelector
              product={product}
              rentalEligible={rentalEligible}
              ownedFormats={entitlement.ownedFormats}
              activeRentalExpiresAt={entitlement.activeRentalExpiresAt}
            />
          </div>
        </div>

        <div className="mt-5 lg:mt-10">
          <ProductMobileAbout product={product} />
        </div>

        <div className="mt-9 lg:mt-16">
          <Reveal>
            <RelatedBooks products={relatedProducts} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
