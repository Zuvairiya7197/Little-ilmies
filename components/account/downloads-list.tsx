"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, MoreVertical, Search, ShoppingBag } from "lucide-react";
import type { DownloadRecord } from "@/types/account";

export function DownloadsList({ downloads }: { downloads: DownloadRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return downloads;
    return downloads.filter((download) => download.title.toLowerCase().includes(normalized));
  }, [downloads, query]);

  return (
    <>
      {downloads.length > 0 && (
        <section className="mt-6 xl:mt-5">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300 xl:left-4 xl:h-4 xl:w-4"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your downloaded books"
              aria-label="Search your downloaded books"
              className="tap-target w-full rounded-full bg-cream-50 py-3 pl-10 pr-4 text-sm font-semibold text-ink-600 shadow-soft placeholder:text-ink-300 placeholder:font-medium xl:py-3 xl:pl-10 xl:text-xs"
            />
          </label>
        </section>
      )}

      {downloads.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-cream-50 px-5 pb-8 pt-6 text-center shadow-clay-sm xl:mt-3 xl:rounded-3xl xl:p-6">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[14rem] xl:max-w-[15rem]">
            <Image
              src="/images/no download yet.png"
              alt="Empty download box illustration"
              fill
              sizes="224px"
              className="object-contain"
              priority
            />
          </div>
          <h2 className="mt-3 font-display text-lg font-bold text-ink-700 xl:mt-1 xl:text-xl">No downloads yet</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-500 xl:mt-2 xl:max-w-md xl:text-sm xl:text-ink-400">
            Once you purchase a book, you&apos;ll be able to download it here anytime.
          </p>
          <Link href="/shop" className="btn-primary mt-5 rounded-3xl px-6 py-3 text-sm xl:mt-4 xl:px-6 xl:py-2.5 xl:text-sm">
            <ShoppingBag className="h-4 w-4 xl:h-4 xl:w-4" aria-hidden="true" />
            Browse Books
          </Link>
        </section>
      ) : (
        <section className="mt-4 overflow-hidden rounded-2xl bg-cream-50 p-3 shadow-clay-sm xs:p-4 xl:mt-3 xl:rounded-3xl xl:p-5">
          <div className="hidden grid-cols-[minmax(260px,1.5fr)_0.55fr_0.75fr_0.75fr] gap-5 border-b border-ink-100 pb-3 text-xs font-black uppercase tracking-wide text-ink-600 xl:grid">
            <span>Book</span>
            <span>Type</span>
            <span>Downloaded On</span>
            <span>Action</span>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-ink-400">
              No downloads match &quot;{query}&quot;.
            </p>
          ) : (
            <div className="divide-y divide-ink-100">
              {filtered.map((download) => {
                const purchased = new Date(download.purchasedAt);
                const date = purchased.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                });
                const time = purchased.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={`${download.orderId}-${download.productId}`}
                    className="flex items-center gap-3 py-3 xl:grid xl:grid-cols-[minmax(260px,1.5fr)_0.55fr_0.75fr_0.75fr] xl:items-center xl:gap-5"
                  >
                    <Link href={`/product/${download.slug}`} className="shrink-0">
                      <span className="relative block h-20 w-14 overflow-hidden rounded-lg bg-lilac-50 shadow-sm xs:h-24 xs:w-[4.25rem] xl:h-16 xl:w-12">
                        <Image src={download.coverImage} alt="" fill sizes="80px" className="object-cover" />
                      </span>
                    </Link>
                    <span className="min-w-0 flex-1">
                      <Link href={`/product/${download.slug}`} className="block truncate font-display text-sm font-bold leading-snug text-ink-700 xl:text-sm">
                        {download.title}
                      </Link>
                      <span className="mt-1 block text-[11px] font-black uppercase text-violet-700 xl:hidden">E-book</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-400 xl:mt-1 xl:gap-2 xl:text-xs">
                        <span>{download.fileType}</span>
                        <span aria-hidden="true">•</span>
                        <span>{12 + (download.title.length % 13)} MB</span>
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink-400 xl:hidden">
                        <span>{date}</span>
                        <span aria-hidden="true">•</span>
                        <span>{time}</span>
                      </span>
                    </span>

                    <div className="hidden xl:block">
                      <span className="inline-flex rounded-full bg-lilac-100 px-3 py-1 text-xs font-black uppercase text-violet-700">
                        E-book
                      </span>
                    </div>

                    <div className="hidden text-xs font-semibold leading-relaxed text-ink-500 xl:block">
                      <span className="block">{date}</span>
                      <span className="block text-ink-400">{time}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 xl:gap-4">
                      <a
                        href={`/api/download/${download.productId}`}
                        aria-label={`Download ${download.title}`}
                        className="tap-target flex items-center justify-center rounded-full border border-violet-300 bg-white p-2.5 text-violet-700 hover:bg-lilac-50 xs:gap-2 xs:rounded-xl xs:px-4 xs:py-2.5 xl:gap-2 xl:border-lilac-200 xl:px-4 xl:py-2"
                      >
                        <Download className="h-4 w-4 xl:h-4 xl:w-4" aria-hidden="true" />
                        <span className="hidden text-xs font-black xs:inline xl:text-xs">Download</span>
                      </a>
                      <button
                        type="button"
                        aria-label={`More actions for ${download.title}`}
                        className="tap-target hidden items-center justify-center rounded-full text-ink-500 hover:bg-lilac-50 xl:flex"
                      >
                        <MoreVertical className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}
