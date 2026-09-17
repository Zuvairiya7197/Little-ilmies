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
  Heart,
  Mail,
  Shield,
  Star,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getDownloadsForUser } from "@/lib/db/orders";
import { DownloadsList } from "@/components/account/downloads-list";

export const metadata: Metadata = {
  title: "Downloads",
  robots: { index: false },
};

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

        <section className="relative xl:mt-2 xl:min-h-28">
          <h1 className="flex items-center gap-2.5 font-display text-xl font-bold text-ink-700 xs:text-2xl xl:text-4xl">
            Downloads
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lilac-50 text-violet-600 xl:h-8 xl:w-8 xl:rounded-full xl:bg-gold-50 xl:text-gold-500">
              <Download className="h-4.5 w-4.5 xl:h-4 xl:w-4" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-ink-600 xl:mt-2 xl:max-w-sm xl:text-sm xl:text-ink-400">
            Access all your purchased e-books here. Downloads are available anytime.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-cream-50 p-4 shadow-clay-sm xs:gap-4 xl:mt-3 xl:grid-cols-4 xl:gap-2 xl:rounded-2xl xl:p-3 xl:divide-x xl:divide-ink-100">
          {[
            { label: "Total Downloads", value: downloads.reduce((sum, item) => sum + item.downloadCount, 0) || downloads.length, helper: "All time", icon: Clipboard, tint: "bg-lilac-100 text-violet-700" },
            { label: "Books", value: downloads.length, helper: "Purchased", icon: Check, tint: "bg-sage-50 text-sage-600" },
            { label: "Downloaded", value: downloads.reduce((sum, item) => sum + item.downloadCount, 0), helper: "Completed", icon: Download, tint: "bg-lemon-50 text-sunny-500" },
            { label: "Last Download", value: lastDownloadDate ?? "-", helper: downloads[0]?.title ?? "No downloads yet", icon: Calendar, tint: "bg-blossom-50 text-blossom-500" },
          ].map(({ label, value, helper, icon: Icon, tint }, index) => (
            <div
              key={label}
              className="flex min-w-0 items-center gap-2.5 xl:gap-3 xl:px-3 xl:py-2"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-soft xl:h-12 xl:w-12 ${tint}`}>
                <Icon className="h-4.5 w-4.5 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-ink-500 xl:text-xs">{label}</p>
                <p className={`truncate font-display text-base font-bold xl:mt-0.5 xl:text-xl ${index === 1 ? "text-sage-600" : index === 2 ? "text-sunny-500" : index === 3 ? "text-blossom-500" : "text-ink-700"}`}>
                  {value}
                </p>
                <p className="truncate text-[11px] text-ink-400 xl:text-xs xl:text-ink-300">{helper}</p>
              </div>
            </div>
          ))}
        </section>

        <DownloadsList downloads={downloads} />

        {downloads.length > 0 && (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl bg-lilac-50/55 p-5 shadow-clay-sm xs:flex-row xs:items-center xs:justify-between xl:mt-3 xl:flex-row xl:items-center xl:px-6 xl:py-4">
            <div className="flex min-w-0 items-center gap-3 xl:gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-50 text-violet-700 shadow-soft xl:h-12 xl:w-12 xl:bg-lilac-100 xl:shadow-none">
                <Shield className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-ink-700 xl:text-lg">Your downloads are safe</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-1 xl:max-w-md xl:text-sm xl:text-ink-400">
                  All files are securely attached to your account and available for re-download anytime.
                </p>
              </div>
            </div>
            <Link href="/contact" className="tap-target inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500 bg-cream-50 px-4 py-2.5 text-xs font-bold text-violet-700 hover:bg-lilac-50 xl:gap-2 xl:px-7 xl:py-3 xl:text-base">
              <FileText className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
              How Downloads Work
            </Link>
          </section>
        )}

        <section className="mt-6 flex flex-col gap-4 rounded-2xl bg-green-50/50 p-5 shadow-clay-sm xs:flex-row xs:items-center xs:justify-between xl:mt-4 xl:flex-row xl:items-center xl:justify-between xl:px-7 xl:py-4">
          <div className="flex min-w-0 items-center gap-3 text-left xl:gap-5">
            <div className="relative hidden h-16 w-24 shrink-0 xs:block xl:h-24 xl:w-40">
              <Image
                src="/images/contact support.png"
                alt=""
                fill
                sizes="160px"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold text-ink-700 xl:text-lg">Need help?</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-500 xl:mt-1 xl:max-w-md xl:text-sm xl:text-ink-400">
                If you&apos;re having trouble downloading your books, our support team is here to help.
              </p>
            </div>
          </div>
          <Link href="/contact" className="tap-target inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500 bg-cream-50 px-4 py-2.5 text-xs font-bold text-violet-700 hover:bg-lilac-50 xl:gap-2 xl:border-gold-300 xl:px-7 xl:py-3 xl:text-base xl:text-ink-600 xl:hover:bg-gold-50">
            <Mail className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
            Contact Support
          </Link>
        </section>

        {downloads.length > 0 && (
          <section className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-cream-50/90 p-5 shadow-soft xs:grid-cols-4 xl:mt-5 xl:grid-cols-4 xl:gap-3 xl:p-3 xl:divide-x xl:divide-ink-100">
            {trustItems.map(({ label, copy, icon: Icon, tint }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:py-1.5 xl:text-left">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl xl:h-12 xl:w-12 ${tint}`}>
                  <Icon className="h-4.5 w-4.5 xl:h-6 xl:w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold leading-tight text-ink-700 xl:font-display xl:text-sm">{label}</h3>
                  <p className="mt-1 text-[11px] leading-snug text-ink-500 xl:mt-1 xl:text-xs xl:leading-relaxed xl:text-ink-400">{copy}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
