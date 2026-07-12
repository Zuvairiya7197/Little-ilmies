"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Loader2, BookOpen, AlertTriangle } from "lucide-react";
import { buyerLoginSchema, type BuyerLoginFormValues } from "@/lib/validation/login";

export function BuyerLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerLoginFormValues>({ resolver: zodResolver(buyerLoginSchema) });

  async function onSubmit(values: BuyerLoginFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await signIn("email", {
        email: values.email,
        redirect: false,
        callbackUrl: "/account",
      });

      if (result?.error) {
        setSubmitError("We couldn't send your sign-in link. Please try again in a moment.");
        return;
      }

      setSubmittedEmail(values.email);
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-600">
          <Mail className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-ink-700">Check your email</p>
          <p className="mt-1 max-w-xs text-sm text-ink-400">
            We&apos;ve sent a secure sign-in link to <strong>{submittedEmail}</strong>. It expires
            in 15 minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmittedEmail(null)}
          className="text-sm font-semibold text-sage-700 underline-offset-2 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-50 text-sage-600">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink-700">Login to Little Ilmies</h1>
        <p className="max-w-xs text-sm text-ink-400">
          No password needed. We&apos;ll email you a secure link to sign in.
        </p>
      </div>

      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
          placeholder="you@example.com"
          className="tap-target w-full rounded-xl border border-ink-100 bg-cream-50 px-4 text-base text-ink-600 placeholder:text-ink-300 focus-visible:border-sage-400"
        />
        {errors.email && (
          <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-gold-700">
            {errors.email.message}
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
          "Send Sign-In Link"
        )}
      </button>

      <p className="text-center text-xs text-ink-300">
        Purchased before? Use the same email you checked out with to see your downloads.
      </p>
    </form>
  );
}
