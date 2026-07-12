import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CouponForm } from "@/components/admin/coupon-form";

export const metadata: Metadata = {
  title: "Edit Coupon",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ couponId: string }>;
}

export default async function EditCouponPage({ params }: PageProps) {
  const { couponId } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Edit Coupon
      </h1>
      <CouponForm
        couponId={coupon.id}
        defaultValues={{
          code: coupon.code,
          type: coupon.type,
          value: coupon.type === "PERCENTAGE" ? coupon.value : coupon.value / 100,
          isActive: coupon.isActive,
          maxRedemptions: coupon.maxRedemptions ?? undefined,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0, 10) : undefined,
        }}
      />
    </div>
  );
}
