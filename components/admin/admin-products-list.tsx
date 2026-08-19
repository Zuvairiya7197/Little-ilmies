"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

type AdminProductListItem = {
  id: string;
  title: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED";
  categories: { category: { name: string } }[];
  prices: { currencyCode: string; regularPrice: number }[];
};

export function AdminProductsList({ products }: { products: AdminProductListItem[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        {products.map((product) => {
          const inr = product.prices.find((p) => p.currencyCode === "INR");
          const usd = product.prices.find((p) => p.currencyCode === "USD");
          return (
            <li key={product.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-cream-100">
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
                  <p className="mt-0.5 text-xs text-ink-300">
                    {product.categories.map((c) => c.category.name).join(", ") || "Uncategorized"}
                  </p>
                </div>
                <div className="hidden shrink-0 text-sm text-ink-500 sm:block">
                  {inr ? formatPrice(inr.regularPrice, "INR" as CurrencyCode) : "-"}
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
          <li className="p-8 text-center text-sm text-ink-300">No products yet. Add your first book.</li>
        )}
      </ul>
    </div>
  );
}
