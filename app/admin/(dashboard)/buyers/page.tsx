import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types/pricing";

export const metadata: Metadata = {
  title: "Buyers",
  robots: { index: false },
};

export default async function AdminBuyersPage() {
  const buyers = await prisma.user.findMany({
    where: { role: "BUYER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { where: { status: "PAID" }, select: { totalAmount: true, currencyCode: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Buyers</h1>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {buyers.map((buyer) => {
            const totalsByCurrency = buyer.orders.reduce<Record<string, number>>((acc, o) => {
              acc[o.currencyCode] = (acc[o.currencyCode] ?? 0) + o.totalAmount;
              return acc;
            }, {});

            return (
              <li key={buyer.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-600">
                    {buyer.name ?? buyer.email}
                  </p>
                  <p className="text-xs text-ink-300">
                    {buyer.email} · Joined{" "}
                    {new Date(buyer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                    {buyer.emailVerified ? "" : " · Unverified"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-ink-400">
                    {buyer.orders.length} order{buyer.orders.length !== 1 ? "s" : ""}
                  </span>
                  {Object.entries(totalsByCurrency).map(([currency, amount]) => (
                    <span key={currency} className="font-semibold text-ink-600">
                      {formatPrice(amount, currency as CurrencyCode)}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
          {buyers.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No buyers yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
