"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, Upload } from "lucide-react";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/admin-category";
import {
  FEATURED_CATEGORY_ACCENT_KEYS,
  FEATURED_CATEGORY_ICON_KEYS,
  getFeaturedCategoryIcon,
} from "@/lib/category-display";

export function CategoryForm({
  categoryId,
  defaultValues,
  currentCoverImage,
}: {
  categoryId?: string;
  defaultValues?: Partial<CategoryFormValues>;
  currentCoverImage?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>(currentCoverImage);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      isFeaturedOnHomepage: false,
      displayOrder: 0,
      ...defaultValues,
    },
  });

  const isFeaturedOnHomepage = watch("isFeaturedOnHomepage");
  const iconKey = watch("iconKey");
  const PreviewIcon = getFeaturedCategoryIcon(iconKey);

  function handleCoverFileChange(file: File | null) {
    setCoverFile(file);
    setCoverPreviewUrl(file ? URL.createObjectURL(file) : currentCoverImage);
  }

  async function onSubmit(values: CategoryFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = categoryId ? `/api/admin/categories/${categoryId}` : "/api/admin/categories";
      const res = await fetch(endpoint, {
        method: categoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSubmitError(data?.error ?? `Could not save category (${res.status}).`);
        return;
      }
      if (!data) {
        setSubmitError("Could not save category: the server returned an unexpected response.");
        return;
      }

      const savedId = categoryId ?? data.id;

      if (coverFile && savedId) {
        const fd = new FormData();
        fd.append("file", coverFile);
        fd.append("categoryId", savedId);
        const uploadRes = await fetch("/api/admin/categories/upload-cover", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json().catch(() => null);
          throw new Error(uploadData?.error ?? "Category was saved, but the cover image could not be uploaded.");
        }
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface flex flex-col gap-4 p-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category-name" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Name
          </label>
          <input id="category-name" {...register("name")} className="admin-input" />
          {errors.name && <p className="mt-1 text-xs text-gold-700">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="category-slug" className="mb-1.5 block text-sm font-semibold text-ink-600">
            Slug
          </label>
          <input id="category-slug" {...register("slug")} className="admin-input" />
          {errors.slug && <p className="mt-1 text-xs text-gold-700">{errors.slug.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="category-description" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Description
        </label>
        <textarea
          id="category-description"
          {...register("description")}
          rows={3}
          className="admin-input resize-none"
        />
      </div>

      <div className="rounded-2xl bg-cream-50 p-4 shadow-clay-pressed">
        <label className="tap-target flex items-center gap-2.5 text-sm font-semibold text-ink-600">
          <input type="checkbox" {...register("isFeaturedOnHomepage")} className="h-4 w-4 rounded border-ink-200 text-sage-600 focus:ring-sage-400" />
          Feature on homepage
        </label>
        <p className="mt-1 text-xs text-ink-400">
          Shows this category as one of the homepage &quot;Featured Collections&quot; tiles.
        </p>

        {isFeaturedOnHomepage && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category-display-order" className="mb-1.5 block text-sm font-semibold text-ink-600">
                Display order
              </label>
              <input
                id="category-display-order"
                type="number"
                {...register("displayOrder")}
                className="admin-input"
              />
              <p className="mt-1 text-xs text-ink-400">Lower numbers appear first.</p>
              {errors.displayOrder && <p className="mt-1 text-xs text-gold-700">{errors.displayOrder.message}</p>}
            </div>

            <div>
              <label htmlFor="category-icon" className="mb-1.5 block text-sm font-semibold text-ink-600">
                Icon
              </label>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                  <PreviewIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <select id="category-icon" {...register("iconKey")} className="admin-input">
                  <option value="">Default</option>
                  {FEATURED_CATEGORY_ICON_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              {errors.iconKey && <p className="mt-1 text-xs text-gold-700">{errors.iconKey.message}</p>}
            </div>

            <div>
              <label htmlFor="category-accent" className="mb-1.5 block text-sm font-semibold text-ink-600">
                Accent color
              </label>
              <select id="category-accent" {...register("accentColor")} className="admin-input">
                <option value="">Default</option>
                {FEATURED_CATEGORY_ACCENT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              {errors.accentColor && <p className="mt-1 text-xs text-gold-700">{errors.accentColor.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-600">Tile image</label>
              {coverPreviewUrl && (
                <div className="relative mb-2 aspect-[4/3] w-32 overflow-hidden rounded-xl bg-cream-200">
                  <Image src={coverPreviewUrl} alt="" fill sizes="128px" className="object-cover" />
                </div>
              )}
              <label className="tap-target flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-cream-100 px-4 py-3 text-sm text-ink-500 hover:border-sage-300">
                <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                {coverFile ? coverFile.name : "Choose image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => handleCoverFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-1 text-xs text-ink-400">
                {categoryId
                  ? "Uploads immediately after you save."
                  : "Uploads once this category is saved for the first time."}
              </p>
            </div>
          </div>
        )}
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
