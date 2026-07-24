import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Check,
  CloudDownload,
  Download,
  Heart,
  Mail,
  MoreVertical,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/get-session";
import { getOrdersForUser } from "@/lib/db/orders";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Purchase History",
  robots: { index: false },
};

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    body: "Your data is always safe with us.",
    tint: "bg-lilac-50 text-violet-700",
  },
  {
    icon: CloudDownload,
    title: "Instant Access",
    body: "Download and read your books instantly.",
    tint: "bg-teal-50 text-teal-500",
  },
  {
    icon: Heart,
    title: "Made with Love",
    body: "For little hearts and curious minds.",
    tint: "bg-blossom-50 text-blossom-500",
  },
  {
    icon: Star,
    title: "Trusted by Parents",
    body: "Loved by thousands of families.",
    tint: "bg-lemon-50 text-lemon-500",
  },
] as const;

export default async function PurchaseHistoryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const orders = await getOrdersForUser(userId);
  const totalDownloads = orders.reduce((sum, order) => sum + order.items.length, 0);
  const lastOrderDate = orders[0]
    ? new Date(orders[0].createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="relative isolate min-h-[calc(100vh-8rem)] overflow-hidden bg-gradient-to-br from-cream via-blossom-50/20 to-ink-50/20 pb-44 pt-14 xl:pb-6 xl:pt-4">
      <div className="container-content relative">
        <div className="relative min-h-0 text-center xl:text-left">
          <h1 className="font-display text-[1.7rem] font-bold leading-tight text-ink-700 xl:text-4xl">
            Purchase History <span className="text-blossom-400">♥</span>
          </h1>
          <p className="mt-4 flex flex-col items-center gap-1 text-sm font-medium leading-snug text-ink-400 xl:mt-2 xl:flex-row xl:flex-wrap xl:items-center xl:gap-2 xl:text-base">
            {orders.length === 0 ? "Signed in as" : "Orders linked to"}{" "}
            <span className="font-bold text-ink-600">{session.user.email}</span>
            {orders.length === 0 && (
              <span className="relative ml-2 hidden w-24 xl:inline-block" aria-hidden="true">
              <span className="absolute left-0 top-1 h-px w-20 border-t border-dashed border-ink-200" />
              <Image src="/images/star.png" alt="" width={26} height={26} className="absolute right-0 -top-3 h-6 w-6 object-contain" />
            </span>
            )}
          </p>
          {orders.length > 0 && (
            <div className="pointer-events-none absolute right-0 top-0 hidden h-56 w-[30rem] xl:block">
              <Image
                src="/images/purchase history.png"
                alt=""
                fill
                sizes="480px"
                className="object-contain object-right"
                aria-hidden="true"
                priority
              />
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <>
          <div className="mx-auto mt-14 flex max-w-[47.5rem] flex-col items-center rounded-[2rem] bg-cream-50 px-8 pb-16 pt-12 text-center shadow-clay-sm xl:mt-0 xl:max-w-md xl:bg-transparent xl:p-0 xl:shadow-none">
            <div className="relative aspect-[4/3] w-full max-w-[27rem] xl:max-w-xs">
              <Image
                src="/images/no purchase yet.png"
                alt="Clipboard illustration for no purchases yet"
                fill
                sizes="(max-width: 768px) 90vw, 576px"
                className="object-contain"
                priority
              />
            </div>
            <h2 className="mt-5 font-display text-[1.7rem] font-bold leading-tight text-ink-700 xl:-mt-5 xl:text-3xl">
              No purchases yet
            </h2>
            <p className="mt-6 max-w-[34rem] text-sm font-medium leading-relaxed text-ink-500 xl:mt-1.5 xl:max-w-sm xl:text-base xl:text-ink-400">
              Once you buy a book,
              <br />
              your orders and receipts
              <br className="hidden xl:block" />
              will show up here.
            </p>
            <Link href="/shop" className="btn-primary mt-9 rounded-3xl px-11 py-5 text-sm xl:mt-3 xl:px-7 xl:py-2.5 xl:text-base">
              <ShoppingBag className="h-8 w-8 xl:h-5 xl:w-5" aria-hidden="true" />
              Browse Books
            </Link>
          </div>

          <section className="mx-auto mt-11 grid max-w-[48rem] grid-cols-4 gap-0 rounded-3xl bg-cream-50/90 px-4 py-7 shadow-soft xl:hidden">
            {trustItems.map(({ icon: Icon, title, body, tint }) => (
              <div key={title} className="flex flex-col items-center gap-3 border-r border-ink-100 px-3 text-center last:border-r-0">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft ${tint}`}>
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold leading-tight text-ink-700">{title}</h2>
                  <p className="mt-1 text-xs leading-snug text-ink-500">{body}</p>
                </div>
              </div>
            ))}
          </section>
          </>
        ) : (
          <div className="mt-5">
            <section className="grid rounded-3xl bg-cream-50 p-4 shadow-clay-sm xl:grid-cols-4 xl:divide-x xl:divide-ink-100">
              {[
                { label: "Total Orders", value: orders.length, icon: ShoppingBag, tint: "bg-gold-50 text-gold-500" },
                { label: "Completed", value: orders.filter((order) => order.status === "PAID").length, icon: Check, tint: "bg-sage-50 text-sage-600" },
                { label: "Downloads", value: totalDownloads, icon: Download, tint: "bg-lemon-50 text-sunny-500" },
                { label: "Last Order", value: lastOrderDate ?? "-", icon: Calendar, tint: "bg-blossom-50 text-blossom-500" },
              ].map(({ label, value, icon: Icon, tint }) => (
                <div key={label} className="flex items-center gap-4 px-4 py-2">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft ${tint}`}>
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-500">{label}</p>
                    <p className="mt-1 font-display text-sm font-bold text-ink-700">{value}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="mt-5 rounded-3xl bg-cream-50 p-4 shadow-clay-sm">
              <div className="hidden grid-cols-[1fr_1.4fr_2.2fr_1.1fr_1.4fr_1.7fr] px-5 py-3 text-sm font-bold uppercase text-ink-600 xl:grid">
                <span>Order ID</span>
                <span>Date</span>
                <span>Items</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              <div className="flex flex-col gap-2">
                {orders.slice(0, 4).map((order, index) => {
                  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  });
                  const firstItem = order.items[0];
                  return (
                    <div
                      key={order.id}
                      className="grid gap-4 rounded-2xl border border-ink-100 bg-cream-50 p-3 shadow-soft xl:grid-cols-[1fr_1.4fr_2.2fr_1.1fr_1.4fr_1.7fr] xl:items-center xl:px-5"
                    >
                      <p className="font-semibold text-ink-500">#ILM-{String(index + 1).padStart(4, "0")}</p>
                      <p className="font-medium text-ink-500">{date}</p>
                      <div className="flex items-center gap-3">
                        {firstItem && (
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-blossom-50">
                            <Image src={firstItem.coverImage} alt="" fill sizes="44px" className="object-contain p-1" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-ink-600">{firstItem?.title ?? "Order items"}</p>
                          <p className="text-sm text-ink-400">{order.items.length} e-book</p>
                        </div>
                      </div>
                      <p className="font-semibold text-ink-600">{formatPrice(order.totalAmount, order.currencyCode)}</p>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-sm font-bold text-sage-700">
                        Completed
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-500 text-cream-50">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </span>
                      <div className="flex items-center gap-4">
                        <Link
                          href="/account/downloads"
                          className="tap-target inline-flex items-center gap-2 rounded-xl border border-gold-200 px-4 py-2 text-sm font-bold text-ink-600 hover:bg-gold-50"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download
                        </Link>
                        <button type="button" aria-label="Order actions" className="tap-target text-ink-500">
                          <MoreVertical className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <button type="button" className="tap-target flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-300">‹</button>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-500 font-bold text-cream-50">1</span>
                  <button type="button" className="tap-target flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 font-bold text-ink-500">2</button>
                  <button type="button" className="tap-target flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-500">›</button>
                </div>
                <p className="text-center text-sm text-ink-400 sm:text-base xl:text-sm">Showing 1 to {Math.min(4, orders.length)} of {orders.length} orders</p>
              </div>
            </section>

            <section className="mt-4 flex flex-col gap-4 rounded-3xl bg-cream-50 p-5 shadow-clay-sm xl:flex-row xl:items-center xl:justify-between xl:px-10">
              <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-6 sm:text-left xl:gap-8">
                <div className="relative h-20 w-28 shrink-0">
                  <Image src="/images/check your email.png" alt="" fill sizes="128px" className="object-contain" aria-hidden="true" />
                </div>
                <div className="hidden h-16 w-px bg-ink-100 sm:block" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-sm font-bold text-ink-600">Need help with your order?</h2>
                  <p className="mt-1 max-w-md text-base leading-relaxed text-ink-400">
                    We&apos;re here to help! Contact our support team and we&apos;ll get back to you.
                  </p>
                </div>
              </div>
              <Link href="/contact" className="tap-target inline-flex items-center justify-center gap-2 rounded-xl border border-gold-300 px-5 py-3 text-sm font-bold text-ink-600 hover:bg-gold-50 sm:px-7 sm:text-base">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Contact Support
              </Link>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
