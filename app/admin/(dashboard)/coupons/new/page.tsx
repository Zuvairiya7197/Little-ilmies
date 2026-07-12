import type { Metadata } from "next";
import { CouponForm } from "@/components/admin/coupon-form";

export const metadata: Metadata = {
  title: "Add Coupon",
  robots: { index: false },
};

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
        Add Coupon
      </h1>
      <CouponForm />
    </div>
  );
}
