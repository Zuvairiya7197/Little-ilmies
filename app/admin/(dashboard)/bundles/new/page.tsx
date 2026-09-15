import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { BundleForm } from "@/components/admin/bundle-form";
import { getPricingSettings } from "@/lib/settings/pricing-settings";

export const metadata: Metadata = {
  title: "Add Bundle",
  robots: { index: false },
};

export default async function NewBundlePage() {
  const [products, pricingSettings] = await Promise.all([
    prisma.product.findMany({
      where: { archivedAt: null },
      orderBy: { title: "asc" },
      select: { id: true, title: true, prices: { where: { isActive: true }, select: { currencyCode: true, regularPrice: true } } },
    }),
    getPricingSettings(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Add Bundle
      </h1>
      <BundleForm
        products={products.map((product) => ({
          ...product,
          prices: Object.fromEntries(product.prices.map((price) => [price.currencyCode, price.regularPrice])),
        }))}
        customBundleDiscountPercentage={pricingSettings.customBundleDiscountPercentage}
      />
    </div>
  );
}
