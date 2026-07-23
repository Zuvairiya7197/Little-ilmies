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
    <div className="relative isolate min-h-[calc(100vh-8rem)] overflow-hidden bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20 pb-8 pt-4 xl:pb-6 xl:pt-5">
      <div className="container-content relative">
        <Link
          href="/account"
          className="tap-target inline-flex items-center gap-2 text-sm font-bold text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Account
        </Link>

        <section className="relative mt-2 min-h-24 xl:min-h-28">
          <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
            Downloads
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-50 text-gold-500">
              <Download className="h-4 w-4" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-ink-400">
            Access all your purchased e-books here.
            <br />
            Downloads are available anytime.
          </p>

          <div className="pointer-events-none absolute right-0 top-[-2rem] hidden h-40 w-[24rem] xl:block">
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

        <section className="mt-3 grid rounded-2xl bg-cream-50 p-3 shadow-clay-sm xl:grid-cols-4 xl:divide-x xl:divide-ink-100">
          {[
            { label: "Total Downloads", value: downloads.reduce((sum, item) => sum + item.downloadCount, 0) || downloads.length, helper: "All time", icon: Clipboard, tint: "bg-lilac-100 text-violet-700" },
            { label: "Books", value: downloads.length, helper: "Purchased", icon: Check, tint: "bg-sage-50 text-sage-600" },
            { label: "Downloaded", value: downloads.reduce((sum, item) => sum + item.downloadCount, 0), helper: "Completed", icon: Download, tint: "bg-lemon-50 text-sunny-500" },
            { label: "Last Download", value: lastDownloadDate ?? "-", helper: downloads[0]?.title ?? "No downloads yet", icon: Calendar, tint: "bg-blossom-50 text-blossom-500" },
          ].map(({ label, value, helper, icon: Icon, tint }) => (
            <div key={label} className="flex items-center gap-3 px-3 py-2">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-soft ${tint}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink-500">{label}</p>
                <p className="mt-0.5 font-display text-xl font-bold text-ink-700">{value}</p>
                <p className="text-xs text-ink-300">{helper}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={
                  index === 0
                    ? "tap-target rounded-full bg-gradient-to-r from-violet-700 to-purple-700 px-4 text-xs font-bold text-cream-50 shadow-clay-primary"
                    : "tap-target rounded-full bg-cream-50 px-4 text-xs font-bold text-ink-500 shadow-soft"
                }
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="tap-target rounded-full bg-cream-50 px-5 text-xs font-bold text-ink-500 shadow-soft">
              Latest First
            </button>
            <button type="button" aria-label="Filter downloads" className="tap-target flex items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-soft">
              <Filter className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {downloads.length === 0 ? (
          <section className="mt-3 rounded-3xl bg-cream-50 p-5 text-center shadow-clay-sm xl:p-6">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[15rem]">
              <Image
                src="/images/no download yet.png"
                alt="Empty download box illustration"
                fill
                sizes="384px"
                className="object-contain"
                priority
              />
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-ink-700">No downloads yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-ink-400">
              Once you purchase a book, you&apos;ll be able to
              <br className="hidden sm:block" />
              download it here anytime.
            </p>
            <Link href="/shop" className="btn-primary mt-4 px-6 py-2.5 text-sm">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Browse Books
            </Link>
          </section>
        ) : (
          <section className="mt-3 overflow-hidden rounded-3xl bg-cream-50 p-4 shadow-clay-sm xl:p-5">
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
                    className="grid gap-3 py-3 xl:grid-cols-[minmax(260px,1.5fr)_0.55fr_0.75fr_0.75fr] xl:items-center xl:gap-5"
                  >
                    <Link href={`/product/${download.slug}`} className="flex min-w-0 items-center gap-4">
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-lilac-50 shadow-sm">
                        <Image src={download.coverImage} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                          <span className="block font-display text-sm font-bold leading-snug text-ink-700">
                          {download.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-ink-400">
                          <span>1 e-book</span>
                          <span aria-hidden="true">•</span>
                          <span>{download.fileType}</span>
                          <span aria-hidden="true">•</span>
                          <span>{12 + (download.title.length % 13)} MB</span>
                        </span>
                      </span>
                    </Link>

                    <div>
                      <span className="inline-flex rounded-full bg-lilac-100 px-3 py-1 text-xs font-black uppercase text-violet-700">
                        E-book
                      </span>
                    </div>

                    <div className="text-xs font-semibold leading-relaxed text-ink-500">
                      <span className="block">{date}</span>
                      <span className="block text-ink-400">{time}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <a
                        href={`/api/download/${download.productId}`}
                        className="tap-target inline-flex items-center justify-center gap-2 rounded-xl border border-lilac-200 bg-white px-4 py-2 text-xs font-black text-violet-700 hover:bg-lilac-50"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download
                      </a>
                      <button
                        type="button"
                        aria-label={`More actions for ${download.title}`}
                        className="tap-target flex items-center justify-center rounded-full text-ink-500 hover:bg-lilac-50"
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
          <section className="mt-3 flex flex-col gap-4 rounded-3xl bg-lilac-50/55 p-4 shadow-clay-sm xl:flex-row xl:items-center xl:justify-between xl:px-6">
            <div className="flex items-center gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac-100 text-violet-700">
                <Shield className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-700">Your downloads are safe</h2>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-400">
                  All files are securely attached to your account and available for re-download anytime.
                </p>
              </div>
            </div>
            <Link href="/contact" className="tap-target inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500 bg-cream-50 px-7 py-3 font-bold text-violet-700 hover:bg-lilac-50">
              <FileText className="h-5 w-5" aria-hidden="true" />
              How Downloads Work
            </Link>
          </section>
        )}

        <section className="mt-4 flex flex-col gap-4 rounded-3xl bg-green-50/50 p-4 shadow-clay-sm xl:flex-row xl:items-center xl:justify-between xl:px-7">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-40 shrink-0">
              <Image
                src="/images/contact support.png"
                alt=""
                fill
                sizes="160px"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            <div className="h-12 w-px bg-ink-100" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-ink-700">Need help?</h2>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-400">
                If you&apos;re having trouble downloading your books, our support team is here to help.
              </p>
            </div>
          </div>
          <Link href="/contact" className="tap-target inline-flex items-center justify-center gap-2 rounded-xl border border-gold-300 bg-cream-50 px-7 py-3 font-bold text-ink-600 hover:bg-gold-50">
            <Mail className="h-5 w-5" aria-hidden="true" />
            Contact Support
          </Link>
        </section>

        {downloads.length > 0 && (
          <section className="mt-5 grid gap-3 rounded-3xl bg-cream-50/75 p-3 shadow-soft xl:grid-cols-4 xl:divide-x xl:divide-ink-100">
            {trustItems.map(({ label, copy, icon: Icon, tint }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-1.5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tint}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-ink-700">{label}</h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-ink-400">{copy}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
