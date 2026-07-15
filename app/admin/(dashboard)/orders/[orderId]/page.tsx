import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      payments: true,
      user: true,
    },
  });
  if (!order) notFound();

  const currency = order.currencyCode as CurrencyCode;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {new Date(order.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card-surface p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Items</h2>
            <ul className="flex flex-col divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream-200">
                    <Image src={item.product.coverImage} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-600">{item.product.title}</p>
                    <p className="text-xs text-ink-300">Qty {item.quantity}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ink-600">
                    {formatPrice(item.unitPrice, currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between text-ink-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, currency)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-ink-400">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-base font-semibold text-ink-700">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          <div className="card-surface mt-6 p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Payments</h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-ink-300">No payment records yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-ink-100">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-ink-600">{payment.provider}</p>
                      <p className="text-xs text-ink-300">{payment.providerPaymentId ?? payment.providerOrderId}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-clay-sm ${
                        payment.status === "VERIFIED"
                          ? "bg-sage-50 text-sage-700"
                          : payment.status === "FAILED"
                            ? "bg-ink-100 text-ink-500"
                            : "bg-gold-50 text-gold-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card-surface h-fit p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Buyer</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-xs text-ink-300">Name</dt>
              <dd className="font-semibold text-ink-600">{order.buyerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-300">Email</dt>
              <dd className="font-semibold text-ink-600">{order.buyerEmail}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-300">Account</dt>
              <dd className="font-semibold text-ink-600">
                {order.user ? "Registered buyer" : "Guest checkout"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
