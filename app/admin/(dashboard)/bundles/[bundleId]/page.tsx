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
    prisma.bundle.findUnique({ where: { id: bundleId }, include: { products: true, customPrices: true } }),
    prisma.product.findMany({ where: { archivedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
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
          type: bundle.type,
          isActive: bundle.isActive,
          bundlePriceInr: bundle.bundlePriceInr != null ? bundle.bundlePriceInr / 100 : undefined,
          bundlePriceUsd: bundle.bundlePriceUsd != null ? bundle.bundlePriceUsd / 100 : undefined,
          productIds: bundle.products.map((p) => p.productId),
          sizePrices: Array.from(new Set(bundle.customPrices.map((price) => price.quantity)))
            .sort((a, b) => a - b)
            .map((quantity) => {
              const rows = bundle.customPrices.filter((price) => price.quantity === quantity);
              return {
                quantity,
                enabled: rows.some((row) => row.enabled),
                prices: Object.fromEntries(rows.map((row) => [row.currencyCode, row.price / 100])),
              };
            }),
        }}
      />
    </div>
  );
}
