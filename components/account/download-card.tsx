"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import type { DownloadRecord } from "@/types/account";

export function DownloadCard({ download }: { download: DownloadRecord }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchasedDate = new Date(download.purchasedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/download/${download.productId}`);
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Please log in to download this file."
            : res.status === 403
              ? "This download isn't available on your account."
              : "Download failed. Please try again."
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${download.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="card-surface flex gap-4 p-4 xs:p-5">
      <Link
        href={`/product/${download.slug}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200 xs:h-28"
      >
        <Image src={download.coverImage} alt="" fill sizes="80px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${download.slug}`}>
            <h3 className="line-clamp-2 font-display text-base font-semibold text-ink-600 hover:text-sage-700">
              {download.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-ink-300">
            {download.fileType} · Purchased {purchasedDate}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="tap-target mt-2 flex w-fit items-center gap-1.5 rounded-full bg-ink-500 px-4 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-ink-600 disabled:opacity-60"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Download PDF
        </button>
        {error && <p className="mt-1.5 text-xs text-gold-700">{error}</p>}
      </div>
    </div>
  );
}
