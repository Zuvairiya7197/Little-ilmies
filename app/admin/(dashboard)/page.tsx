import type { Metadata } from "next";
import Link from "next/link";
import { IndianRupee, ShoppingBag, Users, BookOpen, Clock, Download, Star, Landmark, Mail } from "lucide-react";
import {
  getAttentionSummary,
  getRevenueSummary,
  getRecentOrders,
  getMostDownloadedProducts,
} from "@/lib/db/admin-stats";
import { cn } from "@/lib/utils/cn";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const [summary, recentOrders, mostDownloaded, attention] = await Promise.all([
    getRevenueSummary(),
    getRecentOrders(),
    getMostDownloadedProducts(),
    getAttentionSummary(),
  ]);
  const emailShare = attention.emailsSentToday / attention.emailDailyLimit;
  const attentionItems = [
    {
      href: "/admin/reviews",
      icon: Star,
      label: "Reviews to approve",
      value: attention.pendingReviews,
      urgent: attention.pendingReviews > 0,
    },
    {
      href: "/admin/orders",
      icon: Landmark,
      label: "Bank transfers awaiting money",
      value: attention.awaitingBankTransfers,
      urgent: attention.awaitingBankTransfers > 0,
    },
    {
      href: null,
      icon: Mail,
      label: emailShare >= 0.7 ? "Emails today — only essential emails now" : "Emails sent today",
      value: `${attention.emailsSentToday} / ${attention.emailDailyLimit}`,
      urgent: emailShare >= 0.7,
    },
  ];

  const revenueEntries = Object.entries(summary.revenueByCurrency);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {attentionItems.map(({ href, icon: Icon, label, value, urgent }) => {
          const content = (
            <div
              className={cn(
                "flex h-full items-center gap-3 rounded-2xl p-4 shadow-clay-sm",
                urgent ? "bg-gold-50" : "bg-cream-50"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", urgent ? "text-gold-600" : "text-ink-300")} aria-hidden="true" />
              <div className="min-w-0">
                <p className={cn("text-xs", urgent ? "font-semibold text-gold-700" : "text-ink-400")}>{label}</p>
                <p className="font-display text-lg font-semibold text-ink-700">{value}</p>
              </div>
            </div>
          );
          return href ? (
            <Link key={label} href={href} className="block">
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-5">
        {revenueEntries.length > 0 ? (
          revenueEntries.map(([currency, amount]) => (
            <StatCard
              key={currency}
              icon={IndianRupee}
              label={`Revenue (${currency})`}
              value={formatPrice(amount, currency as CurrencyCode)}
            />
          ))
        ) : (
          <StatCard icon={IndianRupee} label="Revenue" value={formatPrice(0, "INR")} />
        )}
        <StatCard icon={ShoppingBag} label="Paid Orders" value={summary.totalOrders} />
        <StatCard icon={Users} label="Buyers" value={summary.totalBuyers} />
        <StatCard icon={BookOpen} label="Published Books" value={summary.totalProducts} />
        <StatCard icon={Clock} label="Pending Orders" value={summary.pendingOrders} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-700">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-sage-700 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-ink-300">No orders yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-600">{order.buyerEmail}</p>
                    <p className="text-xs text-ink-300">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                      {formatPrice(order.totalAmount, order.currencyCode as CurrencyCode)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-700">Most Downloaded</h2>
            <Link href="/admin/downloads" className="text-sm font-semibold text-sage-700 hover:underline">
              View all
            </Link>
          </div>
          {mostDownloaded.length === 0 ? (
            <p className="text-sm text-ink-300">No downloads yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink-100">
              {mostDownloaded.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-ink-600">{product.title}</p>
                  <span className="flex shrink-0 items-center gap-1.5 text-sm text-ink-400">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {product.downloadCount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
