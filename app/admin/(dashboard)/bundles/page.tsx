import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Bundles",
  robots: { index: false },
};

export default async function AdminBundlesPage() {
  const bundles = await prisma.bundle.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Bundles</h1>
        <Link href="/admin/bundles/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Bundle
        </Link>
      </div>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {bundles.map((bundle) => (
            <li key={bundle.id}>
              <Link
                href={`/admin/bundles/${bundle.id}`}
                className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-cream-100"
              >
                <div>
                  <p className="font-semibold text-ink-600">{bundle.name}</p>
                  <p className="text-xs text-ink-300">/{bundle.slug}</p>
                </div>
                <span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-bold text-sage-700">
                  {bundle._count.products} product{bundle._count.products !== 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
          {bundles.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No bundles yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
