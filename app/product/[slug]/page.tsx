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
import { ProductBuyBox } from "@/components/store/product-buy-box";
import { ProductMobileAbout } from "@/components/store/product-mobile-about";
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

            <ProductMobilePrice product={product} />

            <div className="mt-6">
              <ProductBuyBox product={product} />
            </div>
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
