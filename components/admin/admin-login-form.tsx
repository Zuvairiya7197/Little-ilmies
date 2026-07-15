"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { adminLoginSchema, type AdminLoginFormValues } from "@/lib/validation/admin-login";

export function AdminLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(values: AdminLoginFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await signIn("admin-credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError("Incorrect email or password.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-500">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink-700">Admin Login</h1>
        <p className="max-w-xs text-sm text-ink-400">
          Restricted access — Little Ilmies staff only.
        </p>
      </div>

      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Email address
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
          placeholder="admin@littleilmies.com"
          className="store-input rounded-xl"
        />
        {errors.email && (
          <p role="alert" className="mt-1.5 text-xs text-gold-700">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
          placeholder="••••••••"
          className="store-input rounded-xl"
        />
        {errors.password && (
          <p role="alert" className="mt-1.5 text-xs text-gold-700">
            {errors.password.message}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <Lock className="h-4 w-4" aria-hidden="true" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}
