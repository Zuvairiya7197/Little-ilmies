import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPublishedProductSlugs,
  getPublishedProductDetailBySlug,
  getRelatedProductsBySlug,
} from "@/lib/db/catalog";
import { BookPreviewCard } from "@/components/book-preview/book-preview-card";
import { ProductHeader } from "@/components/store/product-header";
import { ProductBuyBox } from "@/components/store/product-buy-box";
import { StickyBuyBar } from "@/components/store/sticky-buy-bar";
import {
  ProductOverview,
  WhatsInside,
  LearningBenefits,
  FileDetails,
  ProductReviews,
} from "@/components/store/product-info-sections";
import { RelatedBooks } from "@/components/store/related-books";
import { ProductMobilePrice } from "@/components/store/product-mobile-price";
import { findPrice } from "@/lib/pricing/resolve-price";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { Reveal } from "@/components/ui/reveal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllPublishedProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductDetailBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: [{ url: product.coverImage }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getPublishedProductDetailBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProductsBySlug(slug, 4);

  const inrPrice = findPrice(product, "INR");
  const schemaPrice = inrPrice
    ? ((inrPrice.salePrice ?? inrPrice.regularPrice) / 100).toFixed(2)
    : undefined;

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
    ...(schemaPrice
      ? {
          offers: {
            "@type": "Offer",
            price: schemaPrice,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Shop", path: "/shop" },
    { name: product.category.name, path: `/shop/${product.category.slug}` },
    { name: product.title, path: `/product/${product.slug}` },
  ]);

  return (
    <div className="pb-24 md:pb-16">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />

      <div className="container-content py-6 xs:py-8 md:py-10">
        <div className="md:grid md:grid-cols-2 md:gap-12">
          <BookPreviewCard
            title={product.title}
            coverImage={product.coverImage}
            previewImages={product.previewImages}
            productSlug={product.slug}
            pageCount={product.pageCount}
            hasFreePreview={product.hasFreePreview}
          />

          <div className="mt-8 md:mt-0">
            <ProductHeader product={product} />

            <ProductMobilePrice product={product} />

            <div className="mt-6">
              <ProductBuyBox product={product} />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-10 md:mt-16 md:max-w-3xl">
          <Reveal>
            <ProductOverview product={product} />
          </Reveal>
          <Reveal>
            <WhatsInside product={product} />
          </Reveal>
          <Reveal>
            <LearningBenefits product={product} />
          </Reveal>
          <Reveal>
            <FileDetails product={product} />
          </Reveal>
          <Reveal>
            <ProductReviews product={product} />
          </Reveal>
        </div>

        <div className="mt-12 md:mt-16">
          <Reveal>
            <RelatedBooks products={relatedProducts} />
          </Reveal>
        </div>
      </div>

      <StickyBuyBar product={product} />
    </div>
  );
}
