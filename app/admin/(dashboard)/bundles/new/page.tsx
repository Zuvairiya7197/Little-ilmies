import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { BundleForm } from "@/components/admin/bundle-form";

export const metadata: Metadata = {
  title: "Add Bundle",
  robots: { index: false },
};

export default async function NewBundlePage() {
  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Add Bundle
      </h1>
      <BundleForm products={products} />
    </div>
  );
}
