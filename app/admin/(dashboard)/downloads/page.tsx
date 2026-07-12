import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Downloads Report",
  robots: { index: false },
};

export default async function AdminDownloadsPage() {
  const products = await prisma.product.findMany({
    orderBy: { downloadCount: "desc" },
    where: { downloadCount: { gt: 0 } },
  });

  const totalDownloads = products.reduce((sum, p) => sum + p.downloadCount, 0);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Downloads Report
      </h1>
      <p className="mb-6 text-sm text-ink-400">{totalDownloads} total downloads across all books</p>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {products.map((product, index) => (
            <li key={product.id} className="flex items-center gap-4 p-4">
              <span className="w-6 shrink-0 text-center text-sm font-bold text-ink-300">{index + 1}</span>
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
                <Image src={product.coverImage} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-600">{product.title}</p>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 text-sm font-bold text-sage-700">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {product.downloadCount}
              </span>
            </li>
          ))}
          {products.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No downloads yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
