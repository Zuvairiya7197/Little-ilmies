import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Abandoned",
  robots: { index: false },
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mailtoLink(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/**
 * Buyers who showed interest but didn't buy: signed-in buyers with books
 * still in their saved cart (see lib/db/cart.ts — carts are emptied after a
 * purchase), and checkouts that created an order but never got paid.
 */
export default async function AdminAbandonedPage() {
  const carts = await prisma.cart.findMany({
    where: { items: { some: {} }, user: { role: "BUYER" } },
    include: {
      user: { select: { email: true, name: true, createdAt: true } },
      items: {
        orderBy: { addedAt: "desc" },
        include: { product: { select: { title: true, slug: true } } },
      },
    },
  });
  carts.sort((a, b) => b.items[0].addedAt.getTime() - a.items[0].addedAt.getTime());

  const unpaidOrders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "FAILED"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: {
        include: {
          product: { select: { title: true } },
          bundle: { select: { name: true } },
        },
      },
    },
  });

  // Hide unpaid orders the buyer later completed (a retry that went through).
  const paidOrders = await prisma.order.findMany({
    where: { status: "PAID", buyerEmail: { in: [...new Set(unpaidOrders.map((o) => o.buyerEmail))] } },
    select: { buyerEmail: true, createdAt: true },
  });
  const abandonedOrders = unpaidOrders.filter(
    (order) =>
      !paidOrders.some(
        (paid) =>
          paid.buyerEmail.toLowerCase() === order.buyerEmail.toLowerCase() &&
          paid.createdAt > order.createdAt,
      ),
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Abandoned</h1>

      <section>
        <h2 className="mb-1 font-display text-lg font-semibold text-ink-600">Saved carts</h2>
        <p className="mb-3 text-xs text-ink-300">
          Signed-in buyers with books still in their cart. Guests&apos; carts aren&apos;t saved.
        </p>
        <div className="card-surface overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {carts.map((cart) => (
              <li key={cart.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-600">
                    {cart.user.name ?? cart.user.email}
                  </p>
                  <p className="text-xs text-ink-300">
                    {cart.user.email} · Joined {formatDate(cart.user.createdAt)} · Last added{" "}
                    {formatDate(cart.items[0].addedAt)}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {cart.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/product/${item.product.slug}`}
                          target="_blank"
                          className="inline-block rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-cream-200"
                        >
                          {item.product.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={mailtoLink(cart.user.email, "Still thinking about your books? 🌙")}
                  className="shrink-0 text-sm font-semibold text-blossom-600 hover:underline"
                >
                  Email
                </a>
              </li>
            ))}
            {carts.length === 0 && (
              <li className="p-8 text-center text-sm text-ink-300">No saved carts.</li>
            )}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-display text-lg font-semibold text-ink-600">Unpaid checkouts</h2>
        <p className="mb-3 text-xs text-ink-300">
          Buyers who started paying but didn&apos;t finish, and haven&apos;t bought since.
        </p>
        <div className="card-surface overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {abandonedOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="truncate text-sm font-semibold text-ink-600 hover:underline"
                  >
                    {order.buyerName} · {order.buyerEmail}
                  </Link>
                  <p className="text-xs text-ink-300">
                    #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)} ·{" "}
                    {formatPrice(order.totalAmount, order.currencyCode as CurrencyCode)}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {order.items
                      .map((item) => item.product?.title ?? item.bundle?.name ?? "Custom bundle")
                      .join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <a
                    href={mailtoLink(order.buyerEmail, "Did something go wrong at checkout? 🌙")}
                    className="text-sm font-semibold text-blossom-600 hover:underline"
                  >
                    Email
                  </a>
                </div>
              </li>
            ))}
            {abandonedOrders.length === 0 && (
              <li className="p-8 text-center text-sm text-ink-300">No unpaid checkouts.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
