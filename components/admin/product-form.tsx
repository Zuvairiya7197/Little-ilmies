"use client";

import { useEffect, useState, useId, cloneElement } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, Upload, Trash2, ChevronDown, Check, Wand2, X } from "lucide-react";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/admin-product";
import { booksMenuSections } from "@/lib/store-navigation";
import { learningGoals } from "@/lib/learning-goals";
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
      learningGoals: [],
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
        await uploadRentalPages(savedId, rentalFiles, setRentalUploadProgress);
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
      <div className="card-surface border-l-4 border-l-ink-400 p-5">
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

      <div className="card-surface border-l-4 border-l-sage-500 p-5">
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

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-ink-600">Learning Goals</p>
          <p className="mb-2 text-xs text-ink-400">
            Controls which &ldquo;Shop by Learning Goal&rdquo; homepage card this book appears under.
          </p>
          <Controller
            control={control}
            name="learningGoals"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {learningGoals.map((goal) => {
                  const value = field.value ?? [];
                  const checked = value.includes(goal.slug);
                  return (
                    <button
                      key={goal.slug}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          checked ? value.filter((slug) => slug !== goal.slug) : [...value, goal.slug]
                        )
                      }
                      className={`flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        checked
                          ? "bg-sage-500 font-semibold text-cream-50"
                          : "bg-cream-100 text-ink-500 hover:bg-cream-200"
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                      {goal.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
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

      <div className="card-surface border-l-4 border-l-gold-500 p-5">
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

      <div className="card-surface border-l-4 border-l-blossom-400 p-5">
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

      <div className="card-surface border-l-4 border-l-teal-500 p-5">
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

      <div className="card-surface border-l-4 border-l-sunny-500 p-5">
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
          {productId ? (
            <RentalPagesUploader
              productId={productId}
              disabled={!rentAndReadEnabled}
              onUploaded={router.refresh}
              setError={setSubmitError}
            />
          ) : (
            <>
              <PreviewPagesField
                files={rentalFiles}
                onChange={setRentalFiles}
                disabled={!rentAndReadEnabled}
                label="Rent & Read Pages"
                placeholder={
                  !rentAndReadEnabled
                    ? "Enable Rent & Read to upload reader pages"
                    : "Choose every page as an image, in order"
                }
              />
              <p className="mt-1.5 text-xs text-ink-300">
                Pages upload once you create the product below.
              </p>
            </>
          )}
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
                  <p className="mb-2 text-xs text-ink-300">Drag a page to reorder it.</p>
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

      <div className="card-surface border-l-4 border-l-lemon-500 p-5">
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
              {productId ? (
                <InstantFileUpload
                  key={`cover-${productId}`}
                  label="Replace Cover Image"
                  accept="image/jpeg,image/png,image/webp"
                  onUpload={async (file, onProgress) => {
                    onProgress(0);
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("productId", productId);
                    await uploadFile("/api/admin/products/upload-cover", fd, "cover image");
                    onProgress(100);
                  }}
                  onDone={router.refresh}
                />
              ) : (
                <FileField
                  label="Cover Image"
                  accept="image/jpeg,image/png,image/webp"
                  file={coverFile}
                  onChange={setCoverFile}
                />
              )}
              {productId ? (
                <InstantFileUpload
                  key={`pdf-${productId}`}
                  label="Replace Main Product PDF"
                  accept="application/pdf"
                  onUpload={async (file, onProgress) => {
                    const blob = await uploadPdfToBlob(productId, file, onProgress);
                    await attachUploadedPdf(productId, blob.pathname, file);
                  }}
                  onDone={router.refresh}
                />
              ) : (
                <FileField
                  label="Main Product PDF"
                  accept="application/pdf"
                  file={pdfFile}
                  onChange={setPdfFile}
                />
              )}
            </div>
            {!productId && pdfUploadProgress !== null && (
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
              Free preview pages are now set from the Rent &amp; Read card above — upload Rent &amp; Read
              pages first, then use &quot;Use these pages as free preview&quot; to pick which ones go public.
            </p>
          </div>
        </div>
        </details>
      </div>

      <div className="card-surface border-l-4 border-l-blossom-600 p-5">
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

      <div className="card-surface border-l-4 border-l-ink-200 p-5">
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

/**
 * A file picker that uploads immediately on selection (rather than
 * waiting for the surrounding form's Save), with its own Add/Uploading/
 * Done states — used for cover and PDF replacement once a product
 * already exists, so a single change doesn't require re-saving the
 * whole product form.
 */
function InstantFileUpload({
  label,
  accept,
  onUpload,
  onDone,
}: {
  label: string;
  accept: string;
  onUpload: (file: File, onProgress: (percentage: number) => void) => Promise<void>;
  onDone?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    setProgress(0);
    try {
      await onUpload(file, setProgress);
      setStatus("done");
      onDone?.();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-600">{label}</label>
      <div className="flex gap-2">
        <label
          className={`tap-target flex w-full items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-cream-50 px-4 py-3 text-sm text-ink-500 hover:border-sage-300 ${status === "uploading" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{file ? file.name : "Choose file"}</span>
          <input
            type="file"
            accept={accept}
            disabled={status === "uploading"}
            className="sr-only"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setStatus("idle");
              setError(null);
            }}
          />
        </label>
        {file && status !== "done" && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={status === "uploading"}
            className="tap-target shrink-0 rounded-xl bg-sage-600 px-4 text-sm font-semibold text-cream-50 hover:bg-sage-700 disabled:opacity-60"
          >
            {status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Add"}
          </button>
        )}
        {status === "done" && (
          <span className="tap-target flex shrink-0 items-center gap-1.5 rounded-xl bg-sage-50 px-4 text-sm font-semibold text-sage-700">
            <Check className="h-4 w-4" aria-hidden="true" />
            Done
          </span>
        )}
      </div>
      {status === "uploading" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-sage-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-gold-700">{error}</p>}
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
          <ol className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto xs:grid-cols-4 sm:grid-cols-6">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="group relative flex flex-col items-center gap-1 rounded-lg bg-cream-100 p-2 text-center"
              >
                <span className="text-xs font-bold text-ink-500">{index + 1}</span>
                <span className="w-full truncate text-[10px] text-ink-400" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove page ${index + 1}: ${file.name}`}
                  className="tap-target absolute right-0.5 top-0.5 rounded-full bg-cream-50 p-1 text-ink-300 hover:bg-gold-50 hover:text-gold-700"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
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

interface RentalPageUploadItem {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

/**
 * Rent & Read page uploader for an existing product. Selecting files
 * stages them (no network call yet); each staged page gets its own
 * "Add" button that uploads and appends just that page to the product,
 * settling into a "Done" state once it's live — mirrors
 * InstantFileUpload's Add/Done pattern instead of auto-uploading on
 * selection.
 */
function RentalPagesUploader({
  productId,
  disabled,
  onUploaded,
  setError,
}: {
  productId: string;
  disabled: boolean;
  onUploaded: () => void;
  setError: (message: string | null) => void;
}) {
  const [items, setItems] = useState<RentalPageUploadItem[]>([]);

  function updateItem(id: string, patch: Partial<RentalPageUploadItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const newItems: RentalPageUploadItem[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "queued",
      progress: 0,
    }));
    setItems((current) => [...current, ...newItems]);
  }

  async function uploadItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.status === "uploading" || item.status === "done") return;

    updateItem(id, { status: "uploading", progress: 0, error: undefined });
    try {
      const compressed = await compressImageInBrowser(item.file);
      const key = rentalPathname(productId, item.file.name, 0);
      const contentType = compressed.type || "image/jpeg";
      const { uploadUrl } = await getPresignedUploadUrl({
        kind: "rental",
        productId,
        key,
        contentType,
        fileSize: compressed.size,
      });
      await uploadToPresignedUrl(uploadUrl, compressed, contentType, (percentage) =>
        updateItem(id, { progress: percentage })
      );
      await finalizeRentalPage(productId, key, true, compressed !== item.file);
      updateItem(id, { status: "done", progress: 100 });
      onUploaded();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      updateItem(id, { status: "error", error: message });
      setError(message);
    }
  }

  return (
    <div>
      <label
        className={`tap-target flex w-full items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-cream-50 px-4 py-3 text-sm text-ink-500 hover:border-sage-300 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
        {disabled ? "Enable Rent & Read to upload reader pages" : "Choose page images to add"}
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

      {items.length > 0 && (
        <ol className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-cream-100 px-3 py-2 text-xs text-ink-500"
            >
              <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
              {item.status === "queued" && (
                <button
                  type="button"
                  onClick={() => uploadItem(item.id)}
                  className="tap-target shrink-0 rounded-full bg-sage-600 px-3 py-1 text-xs font-semibold text-cream-50 hover:bg-sage-700"
                >
                  Add
                </button>
              )}
              {item.status === "uploading" && (
                <span className="flex shrink-0 items-center gap-1.5 font-semibold text-sage-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  {Math.round(item.progress)}%
                </span>
              )}
              {item.status === "done" && (
                <span className="flex shrink-0 items-center gap-1 font-semibold text-sage-700">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Done
                </span>
              )}
              {item.status === "error" && (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold text-gold-700" title={item.error}>
                    Failed
                  </span>
                  <button
                    type="button"
                    onClick={() => uploadItem(item.id)}
                    className="tap-target rounded-full bg-sage-600 px-3 py-1 text-xs font-semibold text-cream-50 hover:bg-sage-700"
                  >
                    Retry
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// The image URL (see productRentalPageUrls) is
// /api/admin/product-assets/rentals/{productId}/{index}?v={encoded pathname}
// — the pathname (e.g. rentals/{productId}/page-3-<uuid>-my-scan.jpg) is
// never sent to the client any other way, so it's recovered from here for
// both display (a human-readable page name) and reordering.
function pathnameFromRentalUrl(src: string): string | null {
  try {
    const v = new URL(src, "http://x").searchParams.get("v");
    return v ? decodeURIComponent(v) : null;
  } catch {
    return null;
  }
}

function rentalPageDisplayName(src: string, index: number): string {
  const pathname = pathnameFromRentalUrl(src);
  const base = pathname?.split("/").pop();
  // Strip the "page-{n}-{uuid}" prefix this app generates, leaving just the
  // admin's original filename slug when one was captured; falls back to a
  // plain page number for pages uploaded before that was tracked.
  const match = base?.match(/^page-\d+-[0-9a-f-]{36}-(.+)\.[a-z0-9]+$/i);
  return match ? match[1].replace(/-/g, " ") : `Page ${index + 1}`;
}

function RentalPageThumbs({
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
  const [isSaving, setIsSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  if (images.length === 0) return null;

  async function commitOrder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;

    const pathnames = images.map((src) => pathnameFromRentalUrl(src));
    if (pathnames.some((p) => !p)) {
      setError("Can't reorder — one or more pages are missing path info. Try refreshing the page.");
      return;
    }
    const reordered = [...(pathnames as string[])];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/upload-rental-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, order: reordered }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not reorder rental pages.");
        return;
      }
      refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ol className="grid grid-cols-4 gap-2.5 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
      {images.map((src, index) => (
        <li
          key={src}
          draggable={!isSaving}
          onDragStart={() => setDragIndex(index)}
          onDragEnter={() => {
            if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) commitOrder(dragIndex, index);
            setDragIndex(null);
            setDragOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setDragOverIndex(null);
          }}
          className={`rounded-lg border p-1 transition-colors ${
            dragOverIndex === index
              ? "border-sage-500 bg-sage-50"
              : dragIndex === index
                ? "border-ink-200 bg-cream-100 opacity-50"
                : "border-ink-100 bg-cream-50"
          } ${isSaving ? "cursor-wait" : "cursor-grab active:cursor-grabbing"}`}
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cream-100">
            {failedIndexes.has(index) ? (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-300">
                Failed to load
              </div>
            ) : (
              // next/image's optimizer fetches this URL server-side without our
              // admin session cookie, so it 400s; this route is admin-authenticated
              // and not cacheable/optimizable by a third party anyway.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                loading="lazy"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover"
                onError={() => setFailedIndexes((current) => new Set(current).add(index))}
              />
            )}
          </div>
          <p className="mt-1 truncate text-center text-[10px] font-semibold text-ink-400" title={rentalPageDisplayName(src, index)}>
            {rentalPageDisplayName(src, index)}
          </p>
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- see RentalPageThumbs above */}
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
    const key = pdfPathname(productId, file.name);
    const { uploadUrl } = await getPresignedUploadUrl({
      kind: "pdf",
      productId,
      key,
      contentType: "application/pdf",
      fileSize: file.size,
    });
    await uploadToPresignedUrl(uploadUrl, file, "application/pdf", onProgress);
    return { pathname: key };
  } catch (error) {
    throw new Error(`Could not upload PDF: ${blobUploadErrorMessage(error)}`);
  }
}

/**
 * Rental pages upload directly to B2 via a presigned URL (like the PDF)
 * rather than through our own server — a raw scan/export can be 15-30MB,
 * well over Vercel's serverless request body-size limit, so the file
 * bytes can never pass through a Next.js API route as a request body.
 * After each upload, a small "finalize" call (JSON only, no file bytes)
 * tells the server which key was just uploaded; the server downloads it
 * from B2 itself (an outbound call, not subject to that body-size limit),
 * compresses it in place if needed, and attaches its path to the
 * product. One page per request throughout, so a book's total size or
 * page count never matters to any single request.
 */
async function uploadRentalPages(
  productId: string,
  files: File[],
  onProgress: (percentage: number) => void
): Promise<void> {
  for (let index = 0; index < files.length; index++) {
    const original = files[index];
    const file = await compressImageInBrowser(original);
    const key = rentalPathname(productId, original.name, index);
    const contentType = file.type || "image/jpeg";
    const { uploadUrl } = await getPresignedUploadUrl({
      kind: "rental",
      productId,
      key,
      contentType,
      fileSize: file.size,
    });
    await uploadToPresignedUrl(uploadUrl, file, contentType, (percentage) => {
      onProgress(((index + percentage / 100) / files.length) * 100);
    });
    await finalizeRentalPage(productId, key, index > 0, file !== original);
    onProgress(((index + 1) / files.length) * 100);
  }
}

async function finalizeRentalPage(productId: string, key: string, append: boolean, skipCompress = false): Promise<void> {
  const res = await fetch("/api/admin/products/upload-rental-pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, key, append, skipCompress }),
  });
  if (res.ok) return;

  const data = await res.json().catch(() => null);
  throw new Error(`Could not finalize rental page: ${data?.error ?? `status ${res.status}`}`);
}

function rentalPathname(productId: string, filename: string, index: number) {
  const ext = filename.match(/\.(jpe?g|png|webp)$/i)?.[0]?.toLowerCase() ?? ".jpg";
  const normalizedExt = ext === ".jpeg" ? ".jpg" : ext;
  const base = filename.slice(0, filename.length - (filename.match(/\.(jpe?g|png|webp)$/i)?.[0]?.length ?? 0));
  // Original filename slug embedded so RentalPageThumbs can show it — it's
  // never used for path lookup (the uuid is unique enough on its own).
  const nameSlug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `rentals/${productId}/page-${index + 1}-${crypto.randomUUID()}${nameSlug ? `-${nameSlug}` : ""}${normalizedExt}`;
}

// Mirrors the server-side sharp() compression the finalize step used to do
// (JPEG quality 85, max 2400px) — but here, in the browser, before the file
// ever reaches B2. This is what lets an upload skip the old
// download-from-B2-then-reupload round trip entirely: B2 only ever
// receives the already-small final file, so the finalize call no longer
// needs to read anything back to compress it (see finalizeRentalPage's
// skipCompress flag below). Falls back to the original file untouched if
// canvas encoding fails for any reason (e.g. an unsupported format).
const COMPRESS_ABOVE_BYTES_CLIENT = 1.5 * 1024 * 1024;
const MAX_DIMENSION_CLIENT = 2400;
const JPEG_QUALITY_CLIENT = 0.85;

async function compressImageInBrowser(file: File): Promise<File> {
  if (file.size <= COMPRESS_ABOVE_BYTES_CLIENT || !file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION_CLIENT / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY_CLIENT)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.(jpe?g|png|webp)$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function getPresignedUploadUrl(params: {
  kind: "pdf" | "preview" | "rental";
  productId: string;
  key: string;
  contentType: string;
  fileSize: number;
}): Promise<{ uploadUrl: string; key: string }> {
  const res = await fetch("/api/admin/products/client-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to get an upload URL.");
  }
  return res.json();
}

/** Uploads a file directly to a presigned B2 URL via XHR (not fetch) so
 * upload progress events are available for the progress bar UI. */
function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (percentage: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

/**
 * The presigned-upload flow can fail for a few reasons that all surface
 * as a generic message — most commonly Backblaze B2 isn't configured yet
 * on this deployment. Point at that likely cause since the raw error
 * rarely names it directly.
 */
function blobUploadErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown upload error";
  if (message.includes("not configured") || message.includes("Failed to get an upload URL")) {
    return `${message} — check that B2_KEY_ID, B2_APP_KEY, B2_ENDPOINT, and B2_BUCKET_NAME are set for this deployment.`;
  }
  return message;
}

function pdfPathname(productId: string, filename: string) {
  const base = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 80);
  return `pdfs/${productId}/${base || "book"}-${crypto.randomUUID()}.pdf`;
}

