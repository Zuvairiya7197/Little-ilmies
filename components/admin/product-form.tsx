"use client";

import { useEffect, useState, useId, cloneElement } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadPresigned } from "@vercel/blob/client";
import { Loader2, AlertTriangle, Upload, Trash2, ChevronDown, Check, Wand2, X } from "lucide-react";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/admin-product";
import { booksMenuSections } from "@/lib/store-navigation";
import type { CurrencyCode } from "@/types/pricing";
import { calculateBookSalePrice, BOOK_SALE_DISCOUNT_PERCENTAGE } from "@/lib/pricing/automatic-pricing";
import { formatPrice } from "@/lib/utils/format";
import { calculateRentalPrice } from "@/lib/rentals/pricing";
import { RENTAL_CURRENCY_CODE, RENTAL_DURATION_DAYS, RENTAL_PERCENTAGE } from "@/lib/rentals/config";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface CurrentProductFiles {
  coverImage?: string;
  hasPdf?: boolean;
  pdfFileName?: string;
  pdfFileSize?: number;
  previewPageCount?: number;
  previewImages?: string[];
  rentalPageCount?: number;
  rentalPageImages?: string[];
}

const CURRENCY_OPTIONS: CurrencyCode[] = ["INR", "USD", "GBP", "AED"];
const AGE_OPTIONS = [
  { value: "0-3", label: "0–3" },
  { value: "3-6", label: "3–6" },
  { value: "6-9", label: "6–9" },
  { value: "9-12", label: "9–12" },
  { value: "12+", label: "12+" },
] as const;

export function ProductForm({
  categories,
  productId,
  defaultValues,
  currentFiles,
  bookSaleDiscountPercentage = BOOK_SALE_DISCOUNT_PERCENTAGE,
}: {
  categories: CategoryOption[];
  productId?: string;
  defaultValues?: Partial<ProductFormValues>;
  currentFiles?: CurrentProductFiles;
  bookSaleDiscountPercentage?: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<number | null>(null);
  const [rentalUploadProgress, setRentalUploadProgress] = useState<number | null>(null);
  const [rentalFiles, setRentalFiles] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      status: "PUBLISHED",
      hasFreePreview: true,
      rentAndReadEnabled: true,
      author: "Zuvairiya Maryam",
      ageRange: "" as ProductFormValues["ageRange"],
      language: "English",
      format: "PDF",
      baseCurrency: "INR",
      tags: [],
      whatsIncluded: [],
      learningObjectives: [],
      suitableFor: [],
      usageLicense: "PERSONAL_USE",
      seoKeywords: [],
      categoryIds: [],
      prices: [{ currencyCode: "INR", regularPrice: 0, isActive: true }],
    },
  });
  const title = watch("title");
  const rentAndReadEnabled = watch("rentAndReadEnabled");
  const slug = watch("slug");
  const shortDescription = watch("shortDescription") ?? "";
  const seoTitle = watch("seoTitle") ?? "";
  const seoDescription = watch("seoDescription") ?? "";
  const previewSlug = slug || slugify(title ?? "");
  const previewTitle = seoTitle || title || "Product SEO title";
  const previewDescription =
    seoDescription || shortDescription || "A short description used by search engines and social previews.";
  const watchedPrices = watch("prices");

  useEffect(() => {
    if (productId || !title) return;
    if (!dirtyFields.slug) {
      setValue("slug", slugify(title), { shouldValidate: true });
    }
    if (!dirtyFields.seoTitle) {
      setValue("seoTitle", title, { shouldValidate: true });
    }
  }, [dirtyFields.seoTitle, dirtyFields.slug, productId, setValue, title]);

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
        await uploadFile("/api/admin/products/upload-cover", fd, "cover image");
      }
      if (pdfFile) {
        setPdfUploadProgress(0);
        const blob = await uploadPdfToBlob(savedId, pdfFile, setPdfUploadProgress);
        await attachUploadedPdf(savedId, blob.pathname, pdfFile);
      }
      if (rentalFiles.length > 0) {
        setRentalUploadProgress(0);
        const pathnames = await uploadRentalPagesToBlob(savedId, rentalFiles, setRentalUploadProgress);
        await attachUploadedRentalPages(savedId, pathnames);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setPdfUploadProgress(null);
      setRentalUploadProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Basic Info</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Title" error={errors.title?.message}>
            <input {...register("title")} className="admin-input" />
          </Field>
          <Field label="Author" error={errors.author?.message}>
            <input {...register("author")} className="admin-input" placeholder="Zuvairiya Maryam" />
          </Field>
          <Field label="Slug" error={errors.slug?.message} hint="lowercase-with-hyphens">
            <input {...register("slug")} className="admin-input" />
          </Field>
          <Field label="Product SKU" error={errors.sku?.message} hint="Optional, unique product code">
            <div className="flex gap-2">
              <input {...register("sku")} className="admin-input uppercase" placeholder="LI-ASMA-001" />
              <button
                type="button"
                onClick={() => setValue("sku", generateSku(title), { shouldDirty: true, shouldValidate: true })}
                className="tap-target flex shrink-0 items-center gap-1.5 rounded-xl border border-ink-100 bg-cream-50 px-3 text-xs font-semibold text-sage-700 hover:bg-sage-50"
              >
                <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                Generate
              </button>
            </div>
          </Field>
          <Field label="Short Description" error={errors.shortDescription?.message} className="lg:col-span-2">
            <input {...register("shortDescription")} className="admin-input" />
          </Field>
          <Field label="Full Description" error={errors.description?.message} className="lg:col-span-2">
            <textarea {...register("description")} rows={4} className="admin-input resize-none" />
          </Field>
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Catalog Details</h2>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-600">Categories</p>
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => <CategoryDropdown categories={categories} value={field.value ?? []} onChange={field.onChange} />}
          />
          {errors.categoryIds && <p className="mt-2 text-xs text-gold-700">{errors.categoryIds.message}</p>}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Field label="Age Range" error={errors.ageRange?.message} className="w-36">
            <select {...register("ageRange")} className="admin-input">
              <option value="">Choose</option>
              {AGE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Language" error={errors.language?.message} className="w-32">
            <select {...register("language")} className="admin-input">
              {["English", "Arabic", "Hindi", "Marathi"].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Format" error={errors.format?.message} className="w-44">
            <select {...register("format")} className="admin-input">
              {["PDF", "Printable PDF", "Interactive PDF"].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Page Count" error={errors.pageCount?.message} className="w-28">
            <input type="number" {...register("pageCount")} className="admin-input" />
          </Field>
          <Field label="Status" className="w-32">
            <select {...register("status")} className="admin-input">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
        </div>
        <ArrayField
          className="mt-5"
          label="Tags / Keywords"
          placeholder="Islamic Studies"
          control={control}
          name="tags"
          error={errors.tags?.message}
        />

      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Product Highlights</h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ArrayField
            label="What's Included"
            placeholder="Child-friendly explanations"
            control={control}
            name="whatsIncluded"
            error={errors.whatsIncluded?.message}
          />
          <ArrayField
            label="Learning Objectives"
            placeholder="Understand their meanings"
            control={control}
            name="learningObjectives"
            error={errors.learningObjectives?.message}
          />
          <ArrayField
            label="Suitable For"
            placeholder="Home learning"
            control={control}
            name="suitableFor"
            error={errors.suitableFor?.message}
          />
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">License / Usage</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Field label="Usage License" error={errors.usageLicense?.message}>
            <select {...register("usageLicense")} className="admin-input">
              <option value="PERSONAL_USE">Personal Use</option>
              <option value="PERSONAL_CLASSROOM">Personal + Classroom</option>
              <option value="COMMERCIAL_USE">Commercial Use</option>
            </select>
          </Field>
          <Field label="License Information" error={errors.licenseInfo?.message}>
            <textarea
              {...register("licenseInfo")}
              rows={3}
              className="admin-input resize-none"
              placeholder="This eBook is for individual use only. It may not be shared, redistributed, or resold."
            />
          </Field>
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-700">Store Settings</h2>
        <div className="grid gap-3 rounded-2xl bg-cream-50 p-3 shadow-clay-pressed sm:grid-cols-2 lg:grid-cols-5">
          <Checkbox label="Bestseller" {...register("isBestseller")} />
          <Checkbox label="New Arrival" {...register("isNewArrival")} />
          <Checkbox label="Featured" {...register("isFeatured")} />
          <Checkbox label="Has Free Preview" {...register("hasFreePreview")} />
          <Checkbox label="Rent & Read" {...register("rentAndReadEnabled")} />
          <Checkbox label="Homepage sample" {...register("isHomepageSample")} />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Field label="Display Order" error={errors.displayOrder?.message} hint="Lower number appears first" className="w-40">
            <input type="number" min="0" {...register("displayOrder")} className="admin-input" />
          </Field>
          <Field label="Product Version" error={errors.productVersion?.message} hint="Optional" className="w-32">
            <input {...register("productVersion")} className="admin-input" placeholder="1.0" />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink-300">Homepage sample uses this book&apos;s uploaded preview pages.</p>
      </div>

      <div className="card-surface p-5">
        <h2 className="font-display text-lg font-semibold text-ink-700">Rent & Read</h2>
        <p className="mt-1 text-xs text-ink-400">
          India-only temporary online reading access. Rental price is automatically calculated — never entered
          manually.
        </p>

        {(() => {
          const inrIndex = watchedPrices?.findIndex((p) => p?.currencyCode === "INR") ?? -1;
          const inrRegularRupees = inrIndex >= 0 ? Number(watchedPrices?.[inrIndex]?.regularPrice) || 0 : 0;
          const inrRegularMinor = Math.round(inrRegularRupees * 100);
          const inrSaleMinor = calculateBookSalePrice(inrRegularMinor, BOOK_SALE_DISCOUNT_PERCENTAGE);
          const rentalPriceMinor = calculateRentalPrice(inrSaleMinor);

          return (
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-cream-50 p-4 shadow-clay-pressed sm:grid-cols-4">
              <div>
                <p className="text-xs font-semibold text-ink-300">Sale Price (INR)</p>
                <p className="mt-0.5 font-display text-base font-semibold text-ink-700">
                  {inrIndex >= 0 ? formatPrice(inrSaleMinor, RENTAL_CURRENCY_CODE) : "No INR price set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-300">Rental Percentage</p>
                <p className="mt-0.5 font-display text-base font-semibold text-ink-700">{RENTAL_PERCENTAGE}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-300">Rental Duration</p>
                <p className="mt-0.5 font-display text-base font-semibold text-ink-700">{RENTAL_DURATION_DAYS} days</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-300">Calculated Rental Price</p>
                <p className="mt-0.5 font-display text-base font-semibold text-sage-700">
                  {inrIndex >= 0 ? formatPrice(rentalPriceMinor, RENTAL_CURRENCY_CODE) : "—"}
                </p>
              </div>
            </div>
          );
        })()}

        <div className="mt-4">
          <PreviewPagesField
            files={rentalFiles}
            onChange={setRentalFiles}
            isReplacing={Boolean(productId)}
            disabled={!rentAndReadEnabled}
            label={productId ? "Replace Rent & Read Pages" : "Rent & Read Pages"}
            placeholder={
              !rentAndReadEnabled
                ? "Enable Rent & Read to upload reader pages"
                : "Choose every page as an image, in order"
            }
          />
          <p className="mt-1.5 text-xs text-ink-300">
            Upload every page of this book as an image (not the PDF). The rental reader serves only these
            images — Rent & Read stays unavailable on the storefront until pages are uploaded, even if enabled
            above.
          </p>
          {rentalUploadProgress !== null && (
            <div className="mt-2 rounded-xl bg-cream-50 px-3 py-2">
              <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-sage-500 transition-all"
                  style={{ width: `${rentalUploadProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-ink-400">
                Uploading rental pages {Math.round(rentalUploadProgress)}%
              </p>
            </div>
          )}
          {productId && (
            <div className="mt-3 rounded-2xl bg-cream-50 p-4 shadow-clay-pressed">
              <p className="text-sm font-semibold text-ink-600">
                Current rental pages:{" "}
                {currentFiles?.rentalPageCount
                  ? `${currentFiles.rentalPageCount} page${currentFiles.rentalPageCount === 1 ? "" : "s"}`
                  : "None uploaded"}
              </p>
              {currentFiles?.rentalPageCount ? (
                <div className="mt-2">
                  <RentalPageThumbs
                    productId={productId}
                    images={currentFiles.rentalPageImages ?? []}
                    refresh={router.refresh}
                    setError={setSubmitError}
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedAsset("rental", productId, router.refresh, setSubmitError)}
                    className="mt-2 text-xs font-semibold text-gold-700 hover:underline"
                  >
                    Remove all rental pages
                  </button>
                  <UseRentalPagesAsPreview
                    productId={productId}
                    images={currentFiles.rentalPageImages ?? []}
                    refresh={router.refresh}
                    setError={setSubmitError}
                  />
                </div>
              ) : null}
            </div>
          )}
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
        <Field label="Base Currency" error={errors.baseCurrency?.message} hint="Shown when a requested regional price is unavailable" className="mb-4 max-w-xs">
          <select {...register("baseCurrency")} className="admin-input">
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
              <Field label="Sale Price" className="w-40" hint={`Automatically calculated at ${bookSaleDiscountPercentage}% off`}>
                <div className="rounded-xl bg-cream-100 px-3 py-2 text-sm font-semibold text-ink-600 shadow-clay-pressed">
                  {formatPrice(
                    calculateBookSalePrice(
                      Math.round((Number(watchedPrices?.[index]?.regularPrice) || 0) * 100),
                      bookSaleDiscountPercentage
                    ),
                    watchedPrices?.[index]?.currencyCode ?? "INR"
                  )}
                </div>
              </Field>
              <Field label="Sale Start" className="w-40">
                <input type="date" {...register(`prices.${index}.saleStartDate`)} className="admin-input" />
              </Field>
              <Field label="Sale End" className="w-40">
                <input type="date" {...register(`prices.${index}.saleEndDate`)} className="admin-input" />
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
            No USD price set. Customers outside India need an active USD/international price before checkout.
          </p>
        )}
      </div>

      <div className="card-surface p-5">
        <details open>
          <summary className="cursor-pointer list-none font-display text-lg font-semibold text-ink-700">
            Files & Preview
          </summary>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          {productId && (
          <div className="rounded-2xl bg-cream-50 p-4 shadow-clay-pressed">
            <p className="text-sm font-semibold text-ink-600">Current uploads</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <CurrentFileStatus label="Cover image" status={currentFiles?.coverImage ? "Uploaded" : "Missing"}>
                {currentFiles?.coverImage && (
                  <>
                    <div className="relative mt-2 aspect-[3/4] w-20 overflow-hidden rounded-lg bg-cream-200">
                      <Image
                        src={currentFiles.coverImage}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedAsset("cover", productId, router.refresh, setSubmitError)}
                      className="mt-2 text-xs font-semibold text-gold-700 hover:underline"
                    >
                      Remove image
                    </button>
                  </>
                )}
              </CurrentFileStatus>
              <CurrentFileStatus
                label="Main Product PDF"
                status={currentFiles?.hasPdf ? currentFiles.pdfFileName ?? "Uploaded" : "Missing"}
              >
                {currentFiles?.hasPdf && (
                  <>
                    {currentFiles.pdfFileSize != null && (
                      <p className="mt-1 text-xs text-ink-300">{formatBytes(currentFiles.pdfFileSize)}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeUploadedAsset("pdf", productId, router.refresh, setSubmitError)}
                      className="mt-2 text-xs font-semibold text-gold-700 hover:underline"
                    >
                      Remove file
                    </button>
                  </>
                )}
              </CurrentFileStatus>
              <CurrentFileStatus
                label="Free Preview"
                status={
                  currentFiles?.previewPageCount
                    ? `${currentFiles.previewPageCount} page${currentFiles.previewPageCount === 1 ? "" : "s"}`
                    : "Missing"
                }
              >
                {currentFiles?.previewPageCount ? (
                  <div className="mt-2">
                    <PreviewThumbs
                      productId={productId}
                      images={currentFiles.previewImages ?? []}
                      refresh={router.refresh}
                      setError={setSubmitError}
                    />
                    <button
                      type="button"
                      onClick={() => removeUploadedAsset("preview", productId, router.refresh, setSubmitError)}
                      className="mt-2 text-xs font-semibold text-gold-700 hover:underline"
                    >
                      Remove all
                    </button>
                  </div>
                ) : null}
              </CurrentFileStatus>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-300">
              Choosing a new file below replaces the current upload when you save changes.
            </p>
          </div>
          )}

          <div className={productId ? "flex flex-col gap-4" : "flex flex-col gap-4 xl:col-span-2"}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FileField
                label={productId ? "Replace Cover Image" : "Cover Image"}
                accept="image/jpeg,image/png,image/webp"
                file={coverFile}
                onChange={setCoverFile}
              />
              <FileField
                label={productId ? "Replace Main Product PDF" : "Main Product PDF"}
                accept="application/pdf"
                file={pdfFile}
                onChange={setPdfFile}
              />
            </div>
            {pdfUploadProgress !== null && (
              <div className="rounded-xl bg-cream-50 px-3 py-2">
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-sage-500 transition-all"
                    style={{ width: `${pdfUploadProgress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-ink-400">
                  Uploading PDF {Math.round(pdfUploadProgress)}%
                </p>
              </div>
            )}
            <p className="rounded-xl bg-cream-50 px-3 py-2 text-xs text-ink-400">
              Free preview pages are now set from the Rent &amp; Read card below — upload Rent &amp; Read
              pages first, then use &quot;Use these pages as free preview&quot; to pick which ones go public.
            </p>
          </div>
        </div>
        </details>
      </div>

      <div className="card-surface p-5">
        <details open>
          <summary className="cursor-pointer list-none font-display text-lg font-semibold text-ink-700">
            SEO
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field
              label="SEO Title"
              error={errors.seoTitle?.message}
              hint={`The title shown in search engine results. ${seoTitle.length}/60`}
              className="lg:col-span-2"
            >
              <input {...register("seoTitle")} className="admin-input" />
            </Field>
            <Field
              label="Meta Description"
              error={errors.seoDescription?.message}
              hint={`A short description used by search engines and social previews. ${seoDescription.length}/160`}
              className="lg:col-span-2"
            >
              <textarea {...register("seoDescription")} rows={3} className="admin-input resize-none" />
            </Field>
            <ArrayField
              className="lg:col-span-2"
              label="SEO Keywords"
              placeholder="Islamic printable"
              helper="Add relevant search phrases people may use to find this product."
              control={control}
              name="seoKeywords"
              error={errors.seoKeywords?.message}
            />
            <div className="rounded-2xl border border-ink-100 bg-cream-50 p-4 lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-300">SEO Preview</p>
              <p className="mt-2 line-clamp-1 text-sm font-semibold text-ink-700">
                {previewTitle}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-sage-700">
                littleilmies.com/product/{previewSlug || "product-slug"}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-400">
                {previewDescription}
              </p>
            </div>
          </div>
          {seoTitle.length > 60 && <p className="mt-3 text-xs text-gold-700">SEO title is longer than the recommended 60 characters.</p>}
          {seoDescription.length > 160 && <p className="mt-1 text-xs text-gold-700">Meta description is longer than the recommended 160 characters.</p>}
        </details>
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

function CategoryDropdown({
  categories,
  value,
  onChange,
}: {
  categories: CategoryOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.filter((category) => value.includes(category.id));
  const groupedCategories = buildCategoryGroups(categories);

  function toggleCategory(categoryId: string) {
    onChange(value.includes(categoryId) ? value.filter((id) => id !== categoryId) : [...value, categoryId]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="admin-input flex min-h-12 w-full items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0 flex-1 truncate">
          {selected.length > 0 ? selected.map((category) => category.name).join(", ") : "Choose categories"}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-300 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-96 overflow-y-auto rounded-2xl border border-ink-100 bg-cream-50 p-3 shadow-lifted">
          {groupedCategories.map((group) => (
            <div key={group.title} className="py-2 first:pt-0 last:pb-0">
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-ink-300">{group.title}</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {group.categories.map((category) => {
                  const checked = value.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`flex min-h-9 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        checked ? "bg-sage-500 font-semibold text-cream-50" : "text-ink-500 hover:bg-cream-100"
                      }`}
                    >
                      <span>{category.name}</span>
                      {checked && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700 hover:bg-gold-50 hover:text-gold-700"
            >
              {category.name} x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryOptionGroup {
  title: string;
  categories: CategoryOption[];
}

function buildCategoryGroups(categories: CategoryOption[]): CategoryOptionGroup[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const used = new Set<string>();
  const groups: CategoryOptionGroup[] = booksMenuSections
    .map((section) => {
      const sectionSlugs = [slugFromHref(section.href), ...section.links.map((link) => slugFromHref(link.href))].filter(
        (slug): slug is string => Boolean(slug)
      );
      const groupCategories = sectionSlugs
        .map((slug) => bySlug.get(slug))
        .filter((category): category is CategoryOption => Boolean(category));
      groupCategories.forEach((category) => used.add(category.id));
      return { title: section.title, categories: uniqueCategories(groupCategories) };
    })
    .filter((group) => group.categories.length > 0);

  const otherCategories = categories.filter((category) => !used.has(category.id));
  if (otherCategories.length > 0) groups.push({ title: "Other", categories: otherCategories });

  return groups;
}

function uniqueCategories(categories: CategoryOption[]) {
  const seen = new Set<string>();
  return categories.filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  });
}

function slugFromHref(href: string) {
  const match = href.match(/^\/shop\/([^?/#]+)/);
  return match?.[1];
}

function CurrentFileStatus({
  label,
  status,
  children,
}: {
  label: string;
  status: string;
  children?: React.ReactNode;
}) {
  const isMissing = status === "Missing";
  return (
    <div className="rounded-xl border border-ink-100 bg-cream-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${isMissing ? "text-gold-700" : "text-sage-700"}`}>
        {status}
      </p>
      {children}
    </div>
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

function ArrayField({
  label,
  placeholder,
  helper,
  control,
  name,
  error,
  className,
}: {
  label: string;
  placeholder: string;
  helper?: string;
  control: Parameters<typeof Controller<ProductFormValues>>[0]["control"];
  name: "tags" | "whatsIncluded" | "learningObjectives" | "suitableFor" | "seoKeywords";
  error?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const values = field.value ?? [];
        const addDraft = () => {
          const entries = draft
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);
          const nextValues = [...values];
          for (const entry of entries) {
            if (!nextValues.includes(entry)) {
              nextValues.push(entry);
            }
          }
          if (nextValues.length === values.length) return;
          field.onChange(nextValues);
          setDraft("");
        };

        return (
          <div className={className}>
            <label className="mb-1.5 block text-sm font-semibold text-ink-600">{label}</label>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addDraft();
                  }
                }}
                className="admin-input"
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={addDraft}
                className="tap-target shrink-0 rounded-xl border border-ink-100 bg-cream-50 px-3 text-xs font-semibold text-sage-700 hover:bg-sage-50"
              >
                Add
              </button>
            </div>
            {helper && <p className="mt-1 text-xs text-ink-300">{helper}</p>}
            {values.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(values.filter((item) => item !== value))}
                    className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700 hover:bg-gold-50 hover:text-gold-700"
                  >
                    {value}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            {error && <p className="mt-1 text-xs text-gold-700">{error}</p>}
          </div>
        );
      }}
    />
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

function PreviewPagesField({
  files,
  onChange,
  isReplacing = false,
  disabled = false,
  label,
  placeholder,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  isReplacing?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}) {
  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    onChange([...files, ...Array.from(fileList)]);
  }

  function removeFile(indexToRemove: number) {
    onChange(files.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-600">
        {label ?? (isReplacing ? "Replace Free Preview Pages" : "Free Preview Pages")}
      </label>
      <label className={`tap-target flex w-full items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-cream-50 px-4 py-3 text-sm text-ink-500 hover:border-sage-300 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
        <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
        {placeholder ?? (disabled ? "Enable free preview to upload preview pages" : "Choose multiple page images")}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-3 rounded-xl border border-ink-100 bg-cream-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-ink-500">{files.length} preview page(s) selected</p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-gold-700 hover:underline"
            >
              Clear all
            </button>
          </div>
          <ol className="flex flex-col gap-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-cream-100 px-3 py-2 text-sm text-ink-500"
              >
                <span className="min-w-0 truncate">
                  Page {index + 1}: {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                  className="tap-target shrink-0 rounded-full p-1 text-ink-300 hover:bg-gold-50 hover:text-gold-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function generateSku(title: string | undefined) {
  const words = (title ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  const code = words.map((word) => word.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4)).join("-").toUpperCase();
  return `LI-${code || "BOOK"}-001`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function removeUploadedAsset(
  kind: "pdf" | "cover" | "preview" | "rental",
  productId: string,
  refresh: () => void,
  setError: (message: string | null) => void
) {
  setError(null);
  const endpoint =
    kind === "pdf"
      ? "/api/admin/products/upload-pdf"
      : kind === "cover"
        ? "/api/admin/products/upload-cover"
        : kind === "rental"
          ? "/api/admin/products/upload-rental-pages"
          : "/api/admin/products/upload-preview";
  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setError(data?.error ?? "Could not remove uploaded file.");
    return;
  }
  refresh();
}

function PreviewThumbs({
  productId,
  images,
  refresh,
  setError,
}: {
  productId: string;
  images: string[];
  refresh: () => void;
  setError: (message: string | null) => void;
}) {
  if (images.length === 0) return null;

  return (
    <ol className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {images.map((src, index) => (
        <li key={src} className="w-20 shrink-0 rounded-lg border border-ink-100 bg-cream-50 p-1">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-100">
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => updatePreviewOrder(productId, index, index - 1, refresh, setError)}
              disabled={index === 0}
              className="rounded bg-cream-100 px-1 py-0.5 text-[10px] font-semibold text-ink-500 disabled:opacity-40"
            >
              Up
            </button>
            <button
              type="button"
              onClick={() => updatePreviewOrder(productId, index, index + 1, refresh, setError)}
              disabled={index === images.length - 1}
              className="rounded bg-cream-100 px-1 py-0.5 text-[10px] font-semibold text-ink-500 disabled:opacity-40"
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => removePreviewPage(productId, index, refresh, setError)}
              className="col-span-2 rounded bg-gold-50 px-1 py-0.5 text-[10px] font-semibold text-gold-700"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}

function RentalPageThumbs({
  images,
}: {
  productId: string;
  images: string[];
  refresh: () => void;
  setError: (message: string | null) => void;
}) {
  if (images.length === 0) return null;

  return (
    <ol className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {images.map((src, index) => (
        <li key={src} className="w-16 shrink-0 rounded-lg border border-ink-100 bg-cream-50 p-1">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-100">
            <Image src={src} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <p className="mt-1 text-center text-[10px] font-semibold text-ink-400">Page {index + 1}</p>
        </li>
      ))}
    </ol>
  );
}

const MAX_PREVIEW_FROM_RENTAL = 8;

function UseRentalPagesAsPreview({
  productId,
  images,
  refresh,
  setError,
}: {
  productId: string;
  images: string[];
  refresh: () => void;
  setError: (message: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(index: number) {
    setSelected((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : current.length >= MAX_PREVIEW_FROM_RENTAL
          ? current
          : [...current, index].sort((a, b) => a - b)
    );
  }

  async function submit() {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/copy-rental-pages-to-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rentalPageIndexes: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not use rental pages as preview.");
        return;
      }
      setIsOpen(false);
      setSelected([]);
      refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 ml-3 text-xs font-semibold text-sage-700 hover:underline"
      >
        Use these pages as free preview
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-sage-200 bg-sage-50 p-3">
      <p className="text-xs font-semibold text-ink-600">
        Pick up to {MAX_PREVIEW_FROM_RENTAL} pages to publish as the public &quot;See before you buy&quot;
        preview. This replaces any existing preview pages — no re-upload needed.
      </p>
      <ol className="mt-2 flex max-w-full flex-wrap gap-2">
        {images.map((src, index) => {
          const isSelected = selected.includes(index);
          return (
            <li key={src}>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={isSelected}
                className={`relative w-16 shrink-0 overflow-hidden rounded-lg border-2 p-1 ${
                  isSelected ? "border-sage-600 bg-cream-50" : "border-transparent bg-cream-50"
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-100">
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <p className="mt-1 text-center text-[10px] font-semibold text-ink-400">Page {index + 1}</p>
                {isSelected && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sage-600 text-cream-50">
                    <Check className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={selected.length === 0 || isSubmitting}
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          Use {selected.length || ""} page{selected.length === 1 ? "" : "s"} as preview
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setSelected([]);
          }}
          className="text-xs font-semibold text-ink-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

async function updatePreviewOrder(
  productId: string,
  fromIndex: number,
  toIndex: number,
  refresh: () => void,
  setError: (message: string | null) => void
) {
  setError(null);
  const res = await fetch("/api/admin/products/upload-preview", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, fromIndex, toIndex }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setError(data?.error ?? "Could not reorder preview pages.");
    return;
  }
  refresh();
}

async function removePreviewPage(
  productId: string,
  index: number,
  refresh: () => void,
  setError: (message: string | null) => void
) {
  setError(null);
  const res = await fetch("/api/admin/products/upload-preview", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, removeIndex: index }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    setError(data?.error ?? "Could not remove preview page.");
    return;
  }
  refresh();
}

async function uploadFile(endpoint: string, formData: FormData, label: string) {
  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (res.ok) return;

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;
  const fallback = `${res.status} ${res.statusText}`.trim();
  throw new Error(data?.error ?? `Could not upload ${label}${fallback ? ` (${fallback})` : ""}.`);
}

async function attachUploadedPdf(productId: string, pathname: string, file: File) {
  const res = await fetch("/api/admin/products/upload-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, pathname, fileName: file.name, fileSize: file.size }),
  });
  if (res.ok) return;

  const data = await res.json().catch(() => null);
  throw new Error(data?.error ?? "Could not attach uploaded PDF to this product.");
}

async function uploadPdfToBlob(
  productId: string,
  file: File,
  onProgress: (percentage: number) => void
) {
  try {
    return await uploadPresigned(pdfPathname(productId, file.name), file, {
      access: "private",
      contentType: "application/pdf",
      handleUploadUrl: "/api/admin/products/client-upload",
      clientPayload: JSON.stringify({ kind: "pdf", productId }),
      multipart: true,
      onUploadProgress: ({ percentage }) => onProgress(percentage),
    });
  } catch (error) {
    throw new Error(`Could not upload PDF to Vercel Blob: ${blobUploadErrorMessage(error)}`);
  }
}

async function attachUploadedRentalPages(productId: string, pathnames: string[]) {
  const res = await fetch("/api/admin/products/upload-rental-pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, pathnames }),
  });
  if (res.ok) return;

  const data = await res.json().catch(() => null);
  throw new Error(data?.error ?? "Could not attach uploaded rental pages to this product.");
}

async function uploadRentalPagesToBlob(
  productId: string,
  files: File[],
  onProgress: (percentage: number) => void
) {
  try {
    const pathnames: string[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const blob = await uploadPresigned(rentalPathname(productId, file.name, index), file, {
        access: "private",
        contentType: file.type || contentTypeForPreview(file.name),
        handleUploadUrl: "/api/admin/products/client-upload",
        clientPayload: JSON.stringify({ kind: "rental", productId, index }),
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => {
          onProgress(((index + percentage / 100) / files.length) * 100);
        },
      });
      pathnames.push(blob.pathname);
      onProgress(((index + 1) / files.length) * 100);
    }
    return pathnames;
  } catch (error) {
    throw new Error(`Could not upload rental pages to Vercel Blob: ${blobUploadErrorMessage(error)}`);
  }
}

/**
 * The Blob client SDK collapses almost any server-side failure from
 * handleUploadUrl into this exact generic string, discarding whatever
 * real error our own route returned — most commonly because
 * BLOB_READ_WRITE_TOKEN isn't set on this deployment (no Blob store
 * connected in the Vercel project). Surface that likely cause here since
 * the SDK won't tell us which failure actually happened.
 */
function blobUploadErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown Blob upload error";
  if (message.includes("Failed to retrieve the presigned URL") || message.includes("Failed to retrieve the client token")) {
    return `${message} — this usually means no Blob store is connected to this Vercel project (Storage → Connect a Blob store), or BLOB_READ_WRITE_TOKEN is missing/invalid. Check the server logs for the exact cause.`;
  }
  return message;
}

function rentalPathname(productId: string, filename: string, index: number) {
  const ext = previewExtension(filename);
  return `rentals/${productId}/page-${index + 1}-${crypto.randomUUID()}${ext}`;
}

function pdfPathname(productId: string, filename: string) {
  const base = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 80);
  return `pdfs/${productId}/${base || "book"}-${crypto.randomUUID()}.pdf`;
}

function previewExtension(filename: string) {
  const ext = filename.match(/\.(jpe?g|png|webp)$/i)?.[0]?.toLowerCase();
  return ext === ".jpeg" ? ".jpg" : ext ?? ".jpg";
}

function contentTypeForPreview(filename: string) {
  const ext = previewExtension(filename);
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}
