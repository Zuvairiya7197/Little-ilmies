"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { bundleFormSchema, type BundleFormValues } from "@/lib/validation/admin-bundle";

export function BundleForm({
  bundleId,
  defaultValues,
  products,
}: {
  bundleId?: string;
  defaultValues?: Partial<BundleFormValues>;
  products: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BundleFormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: { productIds: [], ...defaultValues },
  });

  async function onSubmit(values: BundleFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = bundleId ? `/api/admin/bundles/${bundleId}` : "/api/admin/bundles";
      const res = await fetch(endpoint, {
        method: bundleId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not save bundle.");
        return;
      }
      router.push("/admin/bundles");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface flex flex-col gap-4 p-5" noValidate>
      <div>
        <label htmlFor="bundle-name" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Name
        </label>
        <input id="bundle-name" {...register("name")} className="admin-input" />
        {errors.name && <p className="mt-1 text-xs text-gold-700">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="bundle-slug" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Slug
        </label>
        <input id="bundle-slug" {...register("slug")} className="admin-input" />
        {errors.slug && <p className="mt-1 text-xs text-gold-700">{errors.slug.message}</p>}
      </div>
      <div>
        <label htmlFor="bundle-description" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Description
        </label>
        <textarea
          id="bundle-description"
          {...register("description")}
          rows={3}
          className="admin-input resize-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
        <div>
          <label htmlFor="bundle-price-inr" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Bundle price — INR (paise)
          </label>
          <input
            id="bundle-price-inr"
            type="number"
            {...register("bundlePriceInr")}
            className="admin-input"
          />
        </div>
        <div>
          <label htmlFor="bundle-price-usd" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Bundle price — USD (cents)
          </label>
          <input
            id="bundle-price-usd"
            type="number"
            {...register("bundlePriceUsd")}
            className="admin-input"
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 block text-sm font-semibold text-ink-600">Products in this bundle</p>
        <Controller
          name="productIds"
          control={control}
          render={({ field }) => (
            <div className="max-h-72 overflow-y-auto rounded-xl bg-cream-100 p-3 shadow-clay-pressed">
              <ul className="flex flex-col gap-1">
                {products.map((product) => {
                  const checked = field.value.includes(product.id);
                  return (
                    <li key={product.id}>
                      <label className="tap-target flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-cream-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            field.onChange(
                              e.target.checked
                                ? [...field.value, product.id]
                                : field.value.filter((id) => id !== product.id)
                            );
                          }}
                          className="h-4 w-4 shrink-0 accent-ink-500"
                        />
                        {product.title}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        />
        {errors.productIds && <p className="mt-1 text-xs text-gold-700">{errors.productIds.message}</p>}
      </div>

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-fit disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save"}
      </button>
    </form>
  );
}
