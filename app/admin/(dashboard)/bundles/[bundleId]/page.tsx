import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { BundleForm } from "@/components/admin/bundle-form";

export const metadata: Metadata = {
  title: "Edit Bundle",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ bundleId: string }>;
}

export default async function EditBundlePage({ params }: PageProps) {
  const { bundleId } = await params;
  const [bundle, products] = await Promise.all([
    prisma.bundle.findUnique({ where: { id: bundleId }, include: { products: true } }),
    prisma.product.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!bundle) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Edit Bundle
      </h1>
      <BundleForm
        bundleId={bundle.id}
        products={products}
        defaultValues={{
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description ?? undefined,
          bundlePriceInr: bundle.bundlePriceInr ?? undefined,
          bundlePriceUsd: bundle.bundlePriceUsd ?? undefined,
          productIds: bundle.products.map((p) => p.productId),
        }}
      />
    </div>
  );
}
