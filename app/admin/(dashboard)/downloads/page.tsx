import type { Metadata } from "next";
import Image from "@/components/ui/app-image";
import { Download } from "lucide-react";
import { getDownloadReport, getRecentDownloads } from "@/lib/db/admin-stats";

export const metadata: Metadata = {
  title: "Downloads Report",
  robots: { index: false },
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminDownloadsPage() {
  const [products, recentDownloads] = await Promise.all([getDownloadReport(), getRecentDownloads()]);

  const totalDownloads = products.reduce((sum, p) => sum + p.downloadCount, 0);
  const totalPurchases = products.reduce((sum, p) => sum + p.purchaseCount, 0);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Downloads Report
      </h1>
      <p className="mb-6 text-sm text-ink-400">
        {totalDownloads} download{totalDownloads !== 1 ? "s" : ""} by buyers across {totalPurchases} purchased
        book{totalPurchases !== 1 ? "s" : ""}
      </p>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {products.map((product, index) => (
            <li key={product.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="w-6 shrink-0 text-center text-sm font-bold text-ink-300">{index + 1}</span>
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
                <Image src={product.coverImage} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-600">{product.title}</p>
                <p className="text-xs text-ink-300">
                  Bought {product.purchaseCount} time{product.purchaseCount !== 1 ? "s" : ""} ·{" "}
                  {product.lastDownloadedAt
                    ? `Last downloaded ${formatDateTime(product.lastDownloadedAt)}`
                    : "Not downloaded yet"}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 text-sm font-bold text-sage-700">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {product.downloadCount}
              </span>
            </li>
          ))}
          {products.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No purchased books yet.</li>
          )}
        </ul>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink-600">Recent downloads</h2>
      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {recentDownloads.map((download) => (
            <li key={download.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-600">
                  {download.product.title}
                  {download.format === "BW_PDF" && (
                    <span className="ml-2 text-xs font-medium text-ink-300">Black &amp; white</span>
                  )}
                </p>
                <p className="truncate text-xs text-ink-300">{download.order.buyerEmail}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-ink-400">
                <p>{download.lastDownloadedAt && formatDateTime(download.lastDownloadedAt)}</p>
                <p>
                  {download.downloadCount} download{download.downloadCount !== 1 ? "s" : ""} total
                </p>
              </div>
            </li>
          ))}
          {recentDownloads.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No downloads yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
