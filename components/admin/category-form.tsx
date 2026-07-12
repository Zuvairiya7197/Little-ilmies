"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/admin-category";

export function CategoryForm({
  categoryId,
  defaultValues,
}: {
  categoryId?: string;
  defaultValues?: Partial<CategoryFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

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
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not save category.");
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface flex flex-col gap-4 p-5" noValidate>
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
