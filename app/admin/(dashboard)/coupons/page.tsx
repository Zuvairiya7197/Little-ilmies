import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false },
};

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-700 xs:text-3xl">Coupons</h1>
        <Link href="/admin/coupons/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Coupon
        </Link>
      </div>

      <div className="card-surface overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {coupons.map((coupon) => (
            <li key={coupon.id}>
              <Link
                href={`/admin/coupons/${coupon.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-cream-100"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-ink-600">{coupon.code}</p>
                  <p className="text-xs text-ink-300">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `${(coupon.value / 100).toFixed(2)} off`}
                    {coupon.maxRedemptions ? ` · ${coupon.redemptionCount}/${coupon.maxRedemptions} used` : ` · ${coupon.redemptionCount} used`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    coupon.isActive ? "bg-sage-50 text-sage-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </Link>
            </li>
          ))}
          {coupons.length === 0 && (
            <li className="p-8 text-center text-sm text-ink-300">No coupons yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
