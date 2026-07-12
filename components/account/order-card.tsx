import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import type { OrderRecord } from "@/types/account";

const statusStyles: Record<OrderRecord["status"], string> = {
  PAID: "bg-sage-50 text-sage-700",
  PENDING: "bg-gold-50 text-gold-700",
  FAILED: "bg-ink-100 text-ink-500",
  REFUNDED: "bg-ink-100 text-ink-500",
};

export function OrderCard({ order }: { order: OrderRecord }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card-surface p-4 xs:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-ink-300">Order #{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-ink-600">{date}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.status]}`}>
          {order.status}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-cream-200">
              <Image src={item.coverImage} alt="" fill sizes="44px" className="object-cover" />
            </div>
            <Link
              href={`/product/${item.slug}`}
              className="min-w-0 flex-1 text-sm font-medium text-ink-600 hover:text-sage-700"
            >
              {item.title}
            </Link>
            <span className="shrink-0 text-sm text-ink-400">
              {formatPrice(item.unitPrice, order.currencyCode)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="font-display text-base font-semibold text-ink-700">
          Total: {formatPrice(order.totalAmount, order.currencyCode)}
        </span>
        {order.status === "PAID" && (
          <Link
            href="/account/downloads"
            className="tap-target flex items-center gap-1.5 rounded-full bg-ink-500 px-4 py-2 text-xs font-semibold text-cream-50 hover:bg-ink-600"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Downloads
          </Link>
        )}
      </div>
    </div>
  );
}
