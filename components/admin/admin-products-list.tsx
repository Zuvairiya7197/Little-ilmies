"use client";

import Image from "@/components/ui/app-image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

type AdminProductListItem = {
  id: string;
  title: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED";
  prices: { currencyCode: string; regularPrice: number }[];
  /** What still has to be added — see lib/admin/product-completeness.ts. */
  missing: string[];
  /** Formats currently for sale. */
  liveFormats: string[];
};

export function AdminProductsList({ products }: { products: AdminProductListItem[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  // Coming back to this list (e.g. browser Back after uploading files on a
  // product) restores Next's cached copy, so the "Missing" checklist would
  // show the state from before the upload. Re-fetch once on every visit.
  useEffect(() => {
    router.refresh();
  }, [router]);
  const incompleteCount = products.filter((product) => product.missing.length > 0).length;
  const visibleProducts = onlyIncomplete ? products.filter((product) => product.missing.length > 0) : products;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const hasSelection = selectedIds.length > 0;

  function toggleProduct(productId: string) {
    setMessage(null);
    setSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  function toggleAll() {
    setMessage(null);
    setSelectedIds(allSelected ? [] : products.map((product) => product.id));
  }

  async function deleteSelected() {
    if (!hasSelection || isDeleting) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected book${selectedIds.length === 1 ? "" : "s"}? Books with past orders will be unpublished instead.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.error ?? "Could not delete selected books.");
        return;
      }

      const parts = [
        data.deletedCount ? `${data.deletedCount} deleted` : null,
        data.archivedCount ? `${data.archivedCount} archived` : null,
        data.missingCount ? `${data.missingCount} not found` : null,
      ].filter(Boolean);

      setSelectedIds([]);
      setMessage(parts.length ? parts.join(", ") : "No books changed.");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-cream-50 px-4 py-3">
        <label className="flex items-center gap-3 text-sm font-semibold text-ink-600">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={products.length === 0 || isDeleting}
            className="h-4 w-4 rounded border-ink-200 text-gold-600 focus:ring-gold-400"
          />
          {hasSelection ? `${selectedIds.length} selected` : "Select books"}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gold-700">
            <input
              type="checkbox"
              checked={onlyIncomplete}
              onChange={(event) => setOnlyIncomplete(event.target.checked)}
              className="h-4 w-4 rounded border-ink-200 text-gold-600 focus:ring-gold-400"
            />
            Needs attention ({incompleteCount})
          </label>
          {message && <p className="text-sm font-semibold text-ink-400">{message}</p>}
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!hasSelection || isDeleting}
            className="tap-target inline-flex items-center gap-2 rounded-full border border-gold-200 px-4 py-2 text-sm font-semibold text-gold-700 transition-colors hover:bg-gold-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
            Delete Selected
          </button>
        </div>
      </div>

      <ul className="divide-y divide-ink-100">
        {visibleProducts.map((product) => {
          const inr = product.prices.find((p) => p.currencyCode === "INR");
          const usd = product.prices.find((p) => p.currencyCode === "USD");
          const isPublished = product.status === "PUBLISHED";
          return (
            <li
              key={product.id}
              className={`flex items-center gap-3 border-l-4 p-4 transition-colors hover:bg-cream-100 ${
                isPublished ? "border-l-sage-400" : "border-l-gold-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSet.has(product.id)}
                onChange={() => toggleProduct(product.id)}
                disabled={isDeleting}
                aria-label={`Select ${product.title}`}
                className="h-4 w-4 shrink-0 rounded border-ink-200 text-gold-600 focus:ring-gold-400"
              />
              <Link href={`/admin/products/${product.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
                  <Image src={product.coverImage} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-600">{product.title}</p>
                  {product.missing.length > 0 ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-[11px] font-semibold text-gold-700">Missing:</span>
                      {product.missing.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-semibold text-gold-700"
                        >
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-sage-700">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Ready
                    </p>
                  )}
                  {product.liveFormats.length > 0 && (
                    <p className="mt-1 text-[11px] text-ink-400">On sale: {product.liveFormats.join(" · ")}</p>
                  )}
                </div>
                <div className="hidden shrink-0 text-sm text-ink-500 sm:block">
                  {inr ? formatPrice(inr.regularPrice, "INR" as CurrencyCode) : "-"}
                  {" / "}
                  {usd ? formatPrice(usd.regularPrice, "USD" as CurrencyCode) : "-"}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold shadow-clay-sm ${
                    isPublished ? "bg-sage-500 text-cream-50" : "bg-gold-100 text-gold-700"
                  }`}
                >
                  {product.status}
                </span>
              </Link>
            </li>
          );
        })}
        {products.length === 0 && (
          <li className="p-8 text-center text-sm text-ink-300">No products yet. Add your first book.</li>
        )}
        {products.length > 0 && visibleProducts.length === 0 && (
          <li className="p-8 text-center text-sm text-sage-700">Every book is fully set up.</li>
        )}
      </ul>
    </div>
  );
}
