"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  adminChangePasswordSchema,
  type AdminChangePasswordFormValues,
} from "@/lib/validation/admin-change-password";

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminChangePasswordFormValues>({
    resolver: zodResolver(adminChangePasswordSchema),
  });

  async function onSubmit(values: AdminChangePasswordFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not update password.");
        return;
      }
      setSuccess(true);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface flex flex-col gap-4 p-5" noValidate>
      <div>
        <label htmlFor="current-password" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          className="admin-input"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-gold-700">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold text-ink-600">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
          className="admin-input"
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-gold-700">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className="admin-input"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-gold-700">{errors.confirmPassword.message}</p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      {success && (
        <p className="flex items-start gap-2 rounded-xl bg-sage-50 px-3.5 py-2.5 text-sm text-sage-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Password updated.
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-fit disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Update Password"}
      </button>
    </form>
  );
}
