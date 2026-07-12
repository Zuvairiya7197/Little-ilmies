"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { couponFormSchema, type CouponFormValues } from "@/lib/validation/admin-coupon";

export function CouponForm({
  couponId,
  defaultValues,
}: {
  couponId?: string;
  defaultValues?: Partial<CouponFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: defaultValues ?? { type: "PERCENTAGE", isActive: true },
  });

  const type = watch("type");

  async function onSubmit(values: CouponFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons";
      const res = await fetch(endpoint, {
        method: couponId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, code: values.code.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not save coupon.");
        return;
      }
      router.push("/admin/coupons");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface flex flex-col gap-4 p-5" noValidate>
      <div>
        <label htmlFor="coupon-code" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Code
        </label>
        <input id="coupon-code" {...register("code")} className="admin-input uppercase" placeholder="WELCOME10" />
        {errors.code && <p className="mt-1 text-xs text-gold-700">{errors.code.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
        <div>
          <label htmlFor="coupon-type" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Discount Type
          </label>
          <select id="coupon-type" {...register("type")} className="admin-input">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label htmlFor="coupon-value" className="mb-1.5 block text-sm font-semibold text-ink-600">
            {type === "PERCENTAGE" ? "Percentage Off (%)" : "Amount Off"}
          </label>
          <input id="coupon-value" type="number" step="0.01" {...register("value")} className="admin-input" />
          {errors.value && <p className="mt-1 text-xs text-gold-700">{errors.value.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
        <div>
          <label htmlFor="coupon-max-redemptions" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Max Redemptions (optional)
          </label>
          <input id="coupon-max-redemptions" type="number" {...register("maxRedemptions")} className="admin-input" />
        </div>
        <div>
          <label htmlFor="coupon-expires-at" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Expires On (optional)
          </label>
          <input id="coupon-expires-at" type="date" {...register("expiresAt")} className="admin-input" />
        </div>
      </div>

      <label className="tap-target flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-600">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 rounded border-ink-200 text-sage-600 focus:ring-sage-400"
        />
        Active
      </label>

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-fit disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save Coupon"}
      </button>
    </form>
  );
}
