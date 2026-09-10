import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveCustomBundleBySlug } from "@/lib/db/catalog";
import { CustomBundleBuilder } from "@/components/store/custom-bundle-builder";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getActiveCustomBundleBySlug(slug);
  if (!bundle) return {};
  return {
    title: bundle.name,
    description: bundle.description,
    alternates: { canonical: `/bundle/${bundle.slug}` },
    openGraph: {
      title: bundle.name,
      description: bundle.description,
      images: bundle.coverImage ? [{ url: bundle.coverImage }] : undefined,
    },
  };
}

export default async function BundlePage({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getActiveCustomBundleBySlug(slug);
  if (!bundle) notFound();
  return <CustomBundleBuilder bundle={bundle} />;
}
