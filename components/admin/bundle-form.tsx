"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import {
  bundleFormSchema,
  type BundleFormValues,
} from "@/lib/validation/admin-bundle";
import { CURRENCIES, type CurrencyCode } from "@/types/pricing";
import { calculateCustomBundlePrice } from "@/lib/pricing/automatic-pricing";
import { formatPrice } from "@/lib/utils/format";

const starterQuantities = Array.from({ length: 9 }, (_, index) => index + 2);
const currencyCodes = Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[];

function defaultSizePrices() {
  return starterQuantities.map((quantity) => ({
    quantity,
    enabled: quantity <= 4,
    prices: Object.fromEntries(
      currencyCodes.map((currency) => [currency, undefined]),
    ),
    compareAtPrices: Object.fromEntries(
      currencyCodes.map((currency) => [currency, undefined]),
    ),
  }));
}

export function BundleForm({
  bundleId,
  defaultValues,
  products,
  customBundleDiscountPercentage,
}: {
  bundleId?: string;
  defaultValues?: Partial<BundleFormValues>;
  products: {
    id: string;
    title: string;
    prices: Partial<Record<CurrencyCode, number>>;
  }[];
  customBundleDiscountPercentage: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BundleFormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: {
      type: "FIXED",
      isActive: true,
      productIds: [],
      ...defaultValues,
      sizePrices: defaultSizePrices().map((row) => {
        const saved = defaultValues?.sizePrices?.find(
          (size) => size.quantity === row.quantity,
        );
        return saved
          ? {
              ...row,
              ...saved,
              prices: { ...row.prices, ...saved.prices },
              compareAtPrices: {
                ...row.compareAtPrices,
                ...saved.compareAtPrices,
              },
            }
          : row;
      }),
    },
  });

  const bundleType = useWatch({ control, name: "type" });
  const selectedProductIds = useWatch({ control, name: "productIds" }) ?? [];
  const selectedProducts = products.filter((product) =>
    selectedProductIds.includes(product.id),
  );
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      product.title.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  async function onSubmit(values: BundleFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = bundleId
        ? `/api/admin/bundles/${bundleId}`
        : "/api/admin/bundles";
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card-surface flex flex-col gap-5 p-5"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="bundle-name"
            className="mb-1.5 block text-sm font-semibold text-ink-600"
          >
            Name
          </label>
          <input
            id="bundle-name"
            {...register("name")}
            className="admin-input"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-gold-700">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="bundle-slug"
            className="mb-1.5 block text-sm font-semibold text-ink-600"
          >
            Slug
          </label>
          <input
            id="bundle-slug"
            {...register("slug")}
            className="admin-input"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-gold-700">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="bundle-description"
          className="mb-1.5 block text-sm font-semibold text-ink-600"
        >
          Description
        </label>
        <textarea
          id="bundle-description"
          {...register("description")}
          rows={3}
          className="admin-input resize-none"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-48">
          <label
            htmlFor="bundle-type"
            className="mb-1.5 block text-sm font-semibold text-ink-600"
          >
            Bundle type
          </label>
          <select
            id="bundle-type"
            {...register("type")}
            className="admin-input"
          >
            <option value="FIXED">Fixed bundle</option>
            <option value="CUSTOM">Custom bundle</option>
          </select>
        </div>
        {bundleType === "FIXED" && (
          <>
            <div className="w-36">
              <label
                htmlFor="bundle-price-inr"
                className="mb-1.5 block text-sm font-semibold text-ink-600"
              >
                Price INR
              </label>
              <input
                id="bundle-price-inr"
                type="number"
                step="0.01"
                {...register("bundlePriceInr")}
                className="admin-input"
              />
            </div>
            <div className="w-36">
              <label
                htmlFor="bundle-price-usd"
                className="mb-1.5 block text-sm font-semibold text-ink-600"
              >
                Price USD
              </label>
              <input
                id="bundle-price-usd"
                type="number"
                step="0.01"
                {...register("bundlePriceUsd")}
                className="admin-input"
              />
            </div>
          </>
        )}
        <label className="flex items-center gap-2.5 pb-2.5 text-sm font-semibold text-ink-600">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 accent-ink-500"
          />
          Active
        </label>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <p className="block text-sm font-semibold text-ink-600">
            {bundleType === "CUSTOM"
              ? "Eligible books"
              : "Products in this bundle"}
          </p>
          <label className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="admin-input pl-9"
              placeholder="Search books"
            />
          </label>
        </div>
        <Controller
          name="productIds"
          control={control}
          render={({ field }) => (
            <div className="max-h-72 overflow-y-auto rounded-xl bg-cream-100 p-3 shadow-clay-pressed">
              <ul className="flex flex-col gap-1">
                {filteredProducts.map((product) => {
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
                                : field.value.filter((id) => id !== product.id),
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
        {errors.productIds && (
          <p className="mt-1 text-xs text-gold-700">
            {errors.productIds.message}
          </p>
        )}
      </div>

      {bundleType === "CUSTOM" && (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-600">
            Bundle sizes
          </p>
          <div className="overflow-x-auto rounded-xl bg-cream-100 shadow-clay-pressed">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-bold uppercase text-ink-400">
                <tr>
                  <th className="px-3 py-2">Enabled</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {starterQuantities.map((quantity, index) => (
                  <tr key={quantity}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        {...register(`sizePrices.${index}.enabled`)}
                        className="h-4 w-4 accent-ink-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`sizePrices.${index}.quantity`)}
                        className="admin-input h-9 w-24"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-ink-500">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {(Object.keys(CURRENCIES) as CurrencyCode[]).map(
                          (currency) => {
                            const regularPrices = selectedProducts
                              .map((product) => product.prices[currency])
                              .filter((price): price is number => price != null)
                              .slice(0, quantity);
                            const calculated =
                              regularPrices.length === quantity
                                ? calculateCustomBundlePrice(
                                    regularPrices,
                                    customBundleDiscountPercentage,
                                  )
                                : null;

                            return (
                              <span key={currency}>
                                {currency}:{" "}
                                {calculated
                                  ? formatPrice(calculated.salePrice, currency)
                                  : "Select enough books"}
                              </span>
                            );
                          },
                        )}
                      </div>
                      <p className="mt-1 font-normal text-ink-400">
                        Calculated from the first {quantity} selected books at
                        checkout.
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.sizePrices && (
            <p className="mt-1 text-xs text-gold-700">
              Check enabled quantities and prices.
            </p>
          )}
        </div>
      )}

      {submitError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-fit disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          "Save"
        )}
      </button>
    </form>
  );
}
