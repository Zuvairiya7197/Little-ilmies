import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false },
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { prices: true, categories: { include: { category: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {products.map((product) => {
            const inr = product.prices.find((p) => p.currencyCode === "INR");
            const usd = product.prices.find((p) => p.currencyCode === "USD");
            return (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-cream-100"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
                    <Image src={product.coverImage} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-600">{product.title}</p>
                    <p className="mt-0.5 text-xs text-ink-300">
                      {product.categories.map((c) => c.category.name).join(", ") || "Uncategorized"}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-sm text-ink-500 sm:block">
                    {inr ? formatPrice(inr.regularPrice, "INR" as CurrencyCode) : "—"}
                    {" / "}
                    {usd ? formatPrice(usd.regularPrice, "USD" as CurrencyCode) : (
                      <span className="inline-flex items-center gap-1 text-gold-700">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        no USD price
                      </span>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold shadow-clay-sm ${
                      product.status === "PUBLISHED" ? "bg-sage-50 text-sage-700" : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {product.status}
                  </span>
                </Link>
              </li>
            );
          })}
          {products.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">
              No products yet. Add your first book.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
