import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Orders</h1>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-cream-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-600">{order.buyerEmail}</p>
                  <p className="text-xs text-ink-300">
                    #{order.id.slice(-8).toUpperCase()} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink-600">
                    {formatPrice(order.totalAmount, order.currencyCode as CurrencyCode)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
          {orders.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No orders yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
