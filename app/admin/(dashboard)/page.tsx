import type { Metadata } from "next";
import Link from "next/link";
import { IndianRupee, ShoppingBag, Users, BookOpen, Clock, Download } from "lucide-react";
import { getRevenueSummary, getRecentOrders, getMostDownloadedProducts } from "@/lib/db/admin-stats";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const [summary, recentOrders, mostDownloaded] = await Promise.all([
    getRevenueSummary(),
    getRecentOrders(),
    getMostDownloadedProducts(),
  ]);

  const revenueEntries = Object.entries(summary.revenueByCurrency);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
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
