"use client";

import { useState, useId, cloneElement } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, Upload, Trash2 } from "lucide-react";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/admin-product";
import type { CurrencyCode } from "@/types/pricing";

interface CategoryOption {
  id: string;
  name: string;
}

const CURRENCY_OPTIONS: CurrencyCode[] = ["INR", "USD", "GBP", "AED"];

export function ProductForm({
  categories,
  productId,
  defaultValues,
}: {
  categories: CategoryOption[];
  productId?: string;
  defaultValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      status: "DRAFT",
      hasFreePreview: true,
      categoryIds: [],
      prices: [{ currencyCode: "INR", regularPrice: 0, isActive: true }],
    },
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control,
    name: "prices",
  });

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not save product.");
        return;
      }

      const savedId = productId ?? data.id;

      if (coverFile) {
        const fd = new FormData();
        fd.append("file", coverFile);
        fd.append("productId", savedId);
        await fetch("/api/admin/products/upload-cover", { method: "POST", body: fd });
      }
      if (pdfFile) {
        const fd = new FormData();
        fd.append("file", pdfFile);
        fd.append("productId", savedId);
        await fetch("/api/admin/products/upload-pdf", { method: "POST", body: fd });
      }
      if (previewFiles.length > 0) {
        const fd = new FormData();
        previewFiles.forEach((f) => fd.append("files", f));
        fd.append("productId", savedId);
        await fetch("/api/admin/products/upload-preview", { method: "POST", body: fd });
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Basic Info</h2>
        <div className="flex flex-col gap-4">
          <Field label="Title" error={errors.title?.message}>
            <input {...register("title")} className="admin-input" />
          </Field>
          <Field label="Slug" error={errors.slug?.message} hint="lowercase-with-hyphens">
            <input {...register("slug")} className="admin-input" />
          </Field>
          <Field label="Short Description" error={errors.shortDescription?.message}>
            <input {...register("shortDescription")} className="admin-input" />
          </Field>
          <Field label="Full Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={4} className="admin-input resize-none" />
          </Field>
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Categories</h2>
        <Controller
          control={control}
          name="categoryIds"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const checked = field.value?.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      field.onChange(
                        checked ? field.value.filter((id) => id !== cat.id) : [...(field.value ?? []), cat.id]
                      )
                    }
                    className={`tap-target rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                      checked ? "border-sage-500 bg-sage-500 text-cream-50" : "border-ink-100 text-ink-500"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.categoryIds && <p className="mt-2 text-xs text-gold-700">{errors.categoryIds.message}</p>}
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Details</h2>
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
          <Field label="Age Range" error={errors.ageRange?.message}>
            <select {...register("ageRange")} className="admin-input">
              {["0-3", "3-6", "6-9", "9-12", "12+"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Language" error={errors.language?.message}>
            <select {...register("language")} className="admin-input">
              {["English", "Arabic", "Urdu", "Hindi", "Marathi"].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Format" error={errors.format?.message}>
            <select {...register("format")} className="admin-input">
              {["PDF", "Printable PDF", "Interactive PDF"].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Page Count" error={errors.pageCount?.message}>
            <input type="number" {...register("pageCount")} className="admin-input" />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <Checkbox label="Bestseller" {...register("isBestseller")} />
          <Checkbox label="New Arrival" {...register("isNewArrival")} />
          <Checkbox label="Has Free Preview" {...register("hasFreePreview")} />
          <Checkbox
            label="Feature as homepage sample"
            {...register("isHomepageSample")}
          />
        </div>
        <p className="mt-2 text-xs text-ink-300">
          &quot;Feature as homepage sample&quot; shows this book&apos;s uploaded preview pages in the
          homepage &quot;See before you buy&quot; section. Only one product can be featured at a
          time — selecting it here unfeatures any other product.
        </p>

        <div className="mt-4">
          <Field label="Status">
            <select {...register("status")} className="admin-input">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="card-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-700">Regional Prices</h2>
          <button
            type="button"
            onClick={() => appendPrice({ currencyCode: "USD", regularPrice: 0, isActive: true })}
            className="text-sm font-semibold text-sage-700 hover:underline"
          >
            + Add currency
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {priceFields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-100 p-3">
              <Field label="Currency" className="w-28">
                <select {...register(`prices.${index}.currencyCode`)} className="admin-input">
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Regular Price" className="w-32">
                <input
                  type="number"
                  step="0.01"
                  {...register(`prices.${index}.regularPrice`)}
                  className="admin-input"
                />
              </Field>
              <Field label="Sale Price" className="w-32">
                <input
                  type="number"
                  step="0.01"
                  {...register(`prices.${index}.salePrice`)}
                  className="admin-input"
                />
              </Field>
              <Checkbox label="Active" {...register(`prices.${index}.isActive`)} />
              {priceFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrice(index)}
                  aria-label="Remove this price"
                  className="tap-target ml-auto flex items-center justify-center rounded-full text-ink-300 hover:bg-gold-50 hover:text-gold-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.prices && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gold-700">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.prices.message ?? "Check your price entries"}
          </p>
        )}
        {!priceFields.some((f) => f.currencyCode === "USD") && (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            No USD price set — international customers will see the INR price as an emergency fallback.
          </p>
        )}
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Files</h2>
        <div className="flex flex-col gap-4">
          <FileField
            label="Cover Image"
            accept="image/*"
            file={coverFile}
            onChange={setCoverFile}
          />
          <FileField label="Full PDF (private)" accept="application/pdf" file={pdfFile} onChange={setPdfFile} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-600">
              Sample Preview Pages (public)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPreviewFiles(Array.from(e.target.files ?? []))}
              className="tap-target block w-full rounded-xl border border-dashed border-ink-200 bg-cream-50 px-4 py-3 text-sm text-ink-500"
            />
            {previewFiles.length > 0 && (
              <p className="mt-1.5 text-xs text-ink-400">{previewFiles.length} page(s) selected</p>
            )}
          </div>
        </div>
      </div>

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60 xs:w-fit">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : productId ? (
          "Save Changes"
        ) : (
          "Create Product"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-600">
        {label}
      </label>
      {cloneElement(children, { id })}
      {hint && !error && <p className="mt-1 text-xs text-ink-300">{hint}</p>}
      {error && <p className="mt-1 text-xs text-gold-700">{error}</p>}
    </div>
  );
}

function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="tap-target flex cursor-pointer items-center gap-2 text-sm text-ink-600">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-ink-200 text-sage-600 focus:ring-sage-400" />
      {label}
    </label>
  );
}

function FileField({
  label,
  accept,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-600">{label}</label>
      <label className="tap-target flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-cream-50 px-4 py-3 text-sm text-ink-500 hover:border-sage-300">
        <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
        {file ? file.name : "Choose file"}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
