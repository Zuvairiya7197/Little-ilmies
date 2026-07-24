import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clipboard,
  Cloud,
  FileText,
  Download,
  Filter,
  Heart,
  Mail,
  MoreVertical,
  Shield,
  Star,
  ShoppingBag,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getDownloadsForUser } from "@/lib/db/orders";

export const metadata: Metadata = {
  title: "Downloads",
  robots: { index: false },
};

const filterTabs = ["All Downloads", "Books", "Activities & Worksheets", "Duas"] as const;

const trustItems = [
  { label: "Secure & Private", copy: "Your data is always safe with us.", icon: Shield, tint: "bg-lilac-100 text-violet-700" },
  { label: "Instant Access", copy: "Download and read your books instantly.", icon: Cloud, tint: "bg-green-50 text-green-600" },
  { label: "Made with Love", copy: "For little hearts and curious minds.", icon: Heart, tint: "bg-blossom-50 text-blossom-500" },
  { label: "Trusted by Parents", copy: "Loved by thousands of families.", icon: Star, tint: "bg-lemon-50 text-sunny-500" },
] as const;

export default async function DownloadsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const downloads = await getDownloadsForUser(userId);
  const lastDownloadDate = downloads[0]
    ? new Date(downloads[0].purchasedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="relative isolate min-h-[calc(100vh-8rem)] overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 pb-44 pt-14 xl:pb-6 xl:pt-5">
      <div className="container-content relative">
        <Link
          href="/account"
          className="tap-target hidden items-center gap-2 text-sm font-bold text-ink-500 hover:text-ink-700 xl:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Account
        </Link>

        <section className="relative min-h-[10.5rem] xl:mt-2 xl:min-h-28">
          <h1 className="flex items-center gap-3 font-display text-[1.7rem] font-bold text-ink-700 xl:text-4xl">
            Downloads
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac-50 text-violet-600 xl:h-8 xl:w-8 xl:rounded-full xl:bg-gold-50 xl:text-gold-500">
              <Download className="h-7 w-7 xl:h-4 xl:w-4" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-4 max-w-[26rem] text-sm font-medium leading-relaxed text-ink-600 xl:mt-2 xl:max-w-sm xl:text-sm xl:text-ink-400">
            Access all your purchased e-books here.
            <br />
            Downloads are available anytime.
          </p>

          <div className="pointer-events-none absolute right-0 top-[-1rem] h-44 w-[21rem] xl:top-[-2rem] xl:h-40 xl:w-[24rem]">
            <Image
              src="/images/downloads.png"
              alt=""
              fill
              sizes="448px"
              className="object-contain object-right"
              aria-hidden="true"
              priority
            />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 rounded-[2rem] bg-cream-50 p-8 shadow-clay-sm xl:mt-3 xl:grid-cols-4 xl:gap-2 xl:rounded-2xl xl:p-3 xl:divide-x xl:divide-ink-100">
          {[
            { label: "Total Downloads", value: downloads.reduce((sum, item) => sum + item.downloadCount, 0) || downloads.length, helper: "All time", icon: Clipboard, tint: "bg-lilac-100 text-violet-700" },
            { label: "Books", value: downloads.length, helper: "Purchased", icon: Check, tint: "bg-sage-50 text-sage-600" },
            { label: "Downloaded", value: downloads.reduce((sum, item) => sum + item.downloadCount, 0), helper: "Completed", icon: Download, tint: "bg-lemon-50 text-sunny-500" },
            { label: "Last Download", value: lastDownloadDate ?? "-", helper: downloads[0]?.title ?? "No downloads yet", icon: Calendar, tint: "bg-blossom-50 text-blossom-500" },
          ].map(({ label, value, helper, icon: Icon, tint }, index) => (
            <div
              key={label}
              className="flex items-center gap-7 border-ink-100 px-1 py-5 odd:border-r [&:nth-child(-n+2)]:border-b xl:gap-3 xl:border-b-0 xl:border-r-0 xl:px-3 xl:py-2"
            >
              <span className={`flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl shadow-soft xl:h-12 xl:w-12 ${tint}`}>
                <Icon className="h-9 w-9 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-500 xl:text-xs">{label}</p>
                <p className={`mt-1 font-display text-xl font-bold xl:mt-0.5 xl:text-xl ${index === 1 ? "text-sage-600" : index === 2 ? "text-sunny-500" : index === 3 ? "text-blossom-500" : "text-ink-700"}`}>
                  {value}
                </p>
                <p className="text-sm text-ink-400 xl:text-xs xl:text-ink-300">{helper}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 flex flex-col items-stretch gap-7 xl:mt-5 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between xl:gap-3">
          <div className="grid grid-cols-[1.35fr_0.8fr_1.25fr_0.7fr] gap-5 xl:flex xl:flex-wrap xl:gap-2">
            {filterTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={
                  index === 0
                    ? "tap-target rounded-full bg-gradient-to-r from-violet-700 to-purple-700 px-6 text-sm font-bold text-cream-50 shadow-clay-primary xl:px-4 xl:text-xs"
                    : "tap-target rounded-full bg-cream-50 px-6 text-sm font-bold text-ink-500 shadow-soft xl:px-4 xl:text-xs"
                }
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 xl:justify-end">
            <button type="button" className="tap-target inline-flex min-w-56 items-center justify-between rounded-full bg-cream-50 px-7 text-sm font-bold text-ink-500 shadow-soft xl:min-w-0 xl:px-5 xl:text-xs">
              Latest First
              <span className="text-violet-700" aria-hidden="true">⌄</span>
            </button>
            <button type="button" aria-label="Filter downloads" className="tap-target flex h-16 w-16 items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-soft xl:h-auto xl:w-auto">
              <Filter className="h-8 w-8 xl:h-5 xl:w-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {downloads.length === 0 ? (
          <section className="mt-8 rounded-[2rem] bg-cream-50 px-8 pb-16 pt-12 text-center shadow-clay-sm xl:mt-3 xl:rounded-3xl xl:p-6">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[24rem] xl:max-w-[15rem]">
              <Image
                src="/images/no download yet.png"
                alt="Empty download box illustration"
                fill
                sizes="384px"
                className="object-contain"
                priority
              />
            </div>
            <h2 className="mt-5 font-display text-[1.7rem] font-bold text-ink-700 xl:mt-1 xl:text-xl">No downloads yet</h2>
            <p className="mx-auto mt-5 max-w-[35rem] text-sm font-medium leading-relaxed text-ink-500 xl:mt-2 xl:max-w-md xl:text-sm xl:text-ink-400">
              Once you purchase a book, you&apos;ll be able to
              <br />
              download it here anytime.
            </p>
            <Link href="/shop" className="btn-primary mt-8 rounded-3xl px-10 py-5 text-sm xl:mt-4 xl:px-6 xl:py-2.5 xl:text-sm">
              <ShoppingBag className="h-7 w-7 xl:h-4 xl:w-4" aria-hidden="true" />
              Browse Books
            </Link>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-[2rem] bg-cream-50 p-7 shadow-clay-sm xl:mt-3 xl:rounded-3xl xl:p-5">
            <div className="hidden grid-cols-[minmax(260px,1.5fr)_0.55fr_0.75fr_0.75fr] gap-5 border-b border-ink-100 pb-3 text-xs font-black uppercase tracking-wide text-ink-600 xl:grid">
              <span>Book</span>
              <span>Type</span>
              <span>Downloaded On</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-ink-100">
              {downloads.map((download) => {
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
                    className="grid grid-cols-[8.5rem_minmax(0,1fr)_11rem] items-center gap-7 py-3 xl:grid-cols-[minmax(260px,1.5fr)_0.55fr_0.75fr_0.75fr] xl:gap-5"
                  >
                    <Link href={`/product/${download.slug}`} className="flex min-w-0 items-center gap-4">
                      <span className="relative h-44 w-32 shrink-0 overflow-hidden rounded-xl bg-lilac-50 shadow-sm xl:h-16 xl:w-12 xl:rounded-lg">
                        <Image src={download.coverImage} alt="" fill sizes="(max-width: 1279px) 128px, 64px" className="object-cover" />
                      </span>
                    </Link>
                      <span className="min-w-0">
                        <Link href={`/product/${download.slug}`} className="block font-display text-base font-bold leading-snug text-ink-700 xl:text-sm">
                          {download.title}
                        </Link>
                        <span className="mt-4 block text-sm font-black uppercase text-violet-700 xl:hidden">E-book</span>
                        <span className="mt-4 flex flex-wrap items-center gap-3 text-base font-medium text-ink-400 xl:mt-1 xl:gap-2 xl:text-xs">
                          <span>1 e-book</span>
                          <span aria-hidden="true">•</span>
                          <span>{download.fileType}</span>
                          <span aria-hidden="true">•</span>
                          <span>{12 + (download.title.length % 13)} MB</span>
                        </span>
                        <span className="mt-4 flex flex-wrap items-center gap-3 text-base font-semibold text-ink-400 xl:hidden">
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

                    <div className="flex flex-col items-end gap-7 xl:flex-row xl:items-center xl:gap-4">
                      <button
                        type="button"
                        aria-label={`More actions for ${download.title}`}
                        className="tap-target flex items-center justify-center rounded-full text-ink-500 hover:bg-lilac-50 xl:hidden"
                      >
                        <MoreVertical className="h-8 w-8" aria-hidden="true" />
                      </button>
                      <a
                        href={`/api/download/${download.productId}`}
                        className="tap-target inline-flex items-center justify-center gap-3 rounded-xl border border-violet-300 bg-white px-6 py-4 text-sm font-black text-violet-700 hover:bg-lilac-50 xl:gap-2 xl:border-lilac-200 xl:px-4 xl:py-2 xl:text-xs"
                      >
                        <Download className="h-7 w-7 xl:h-4 xl:w-4" aria-hidden="true" />
                        Download
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
          </section>
        )}

        {downloads.length > 0 && (
          <section className="mt-10 flex items-center justify-between gap-5 rounded-3xl bg-lilac-50/55 p-7 shadow-clay-sm xl:mt-3 xl:flex-row xl:items-center xl:px-6 xl:py-4">
            <div className="flex min-w-0 items-center gap-6 xl:gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cream-50 text-violet-700 shadow-soft xl:h-12 xl:w-12 xl:bg-lilac-100 xl:shadow-none">
                <Shield className="h-10 w-10 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-ink-700 xl:text-lg">Your downloads are safe</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500 xl:mt-1 xl:text-sm xl:text-ink-400">
                  All files are securely attached to your account and available for re-download anytime.
                </p>
              </div>
            </div>
            <Link href="/contact" className="tap-target inline-flex shrink-0 items-center justify-center gap-3 rounded-xl border border-violet-500 bg-cream-50 px-6 py-4 text-sm font-bold text-violet-700 hover:bg-lilac-50 xl:gap-2 xl:px-7 xl:py-3 xl:text-base">
              <FileText className="h-6 w-6 xl:h-5 xl:w-5" aria-hidden="true" />
              How Downloads Work
            </Link>
          </section>
        )}

        <section className="mt-10 flex items-center justify-between gap-4 rounded-3xl bg-green-50/50 p-8 shadow-clay-sm xl:mt-4 xl:flex-row xl:items-center xl:justify-between xl:px-7 xl:py-4">
          <div className="flex min-w-0 items-center gap-6 text-left xl:gap-5">
            <div className="relative h-24 w-36 shrink-0 xl:h-24 xl:w-40">
              <Image
                src="/images/contact support.png"
                alt=""
                fill
                sizes="160px"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            <div className="h-16 w-px bg-ink-100 xl:h-12" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-bold text-ink-700 xl:text-lg">Need help?</h2>
              <p className="mt-2 max-w-[24rem] text-base leading-relaxed text-ink-400 xl:mt-1 xl:max-w-md xl:text-sm">
                If you&apos;re having trouble downloading your books, our support team is here to help.
              </p>
            </div>
          </div>
          <Link href="/contact" className="tap-target inline-flex shrink-0 items-center justify-center gap-3 rounded-xl border border-violet-500 bg-cream-50 px-6 py-4 text-sm font-bold text-violet-700 hover:bg-lilac-50 xl:gap-2 xl:border-gold-300 xl:px-7 xl:py-3 xl:text-base xl:text-ink-600 xl:hover:bg-gold-50">
            <Mail className="h-6 w-6 xl:h-5 xl:w-5" aria-hidden="true" />
            Contact Support
          </Link>
        </section>

        {downloads.length > 0 && (
          <section className="mx-auto mt-10 grid max-w-[48rem] grid-cols-4 gap-0 rounded-3xl bg-cream-50/90 px-4 py-7 shadow-soft xl:mt-5 xl:max-w-none xl:grid-cols-4 xl:gap-3 xl:p-3 xl:divide-x xl:divide-ink-100">
            {trustItems.map(({ label, copy, icon: Icon, tint }) => (
              <div key={label} className="flex flex-col items-center gap-3 border-r border-ink-100 px-3 text-center last:border-r-0 xl:flex-row xl:gap-3 xl:border-r-0 xl:px-3 xl:py-1.5 xl:text-left">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl xl:h-12 xl:w-12 ${tint}`}>
                  <Icon className="h-8 w-8 xl:h-6 xl:w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold leading-tight text-ink-700 xl:font-display xl:text-sm">{label}</h3>
                  <p className="mt-2 text-base font-medium leading-snug text-ink-500 xl:mt-1 xl:text-xs xl:leading-relaxed xl:text-ink-400">{copy}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
