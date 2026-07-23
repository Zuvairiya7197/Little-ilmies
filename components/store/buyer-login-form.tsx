"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Loader2, BookOpen, AlertTriangle, Send, ShieldCheck, Heart } from "lucide-react";
import { buyerLoginSchema, type BuyerLoginFormValues } from "@/lib/validation/login";

export function BuyerLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      router.push(`/login/check-email?email=${encodeURIComponent(values.email)}`);
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xs" noValidate>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-50 text-ink-500 shadow-soft">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-700 sm:text-3xl">Login to Little Ilmies</h1>
        <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-ink-400">
          No password needed. We&apos;ll email you a secure link to sign in.
        </p>
        <div className="mt-4 flex w-24 items-center justify-center gap-3 text-blossom-400" aria-hidden="true">
          <span className="h-px flex-1 bg-blossom-300" />
          <Heart className="h-4 w-4 fill-blossom-400" />
          <span className="h-px flex-1 bg-blossom-300" />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-400" aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
            placeholder="you@example.com"
            className="store-input rounded-2xl pl-12"
          />
        </div>
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

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-4 w-full bg-ink-600 py-3.5 text-base shadow-clay-primary hover:bg-ink-700 disabled:opacity-60">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <Send className="h-5 w-5" aria-hidden="true" />
            Send Sign-in Link
          </>
        )}
      </button>

      <p className="mx-auto mt-3 flex max-w-xs items-start justify-center gap-2 text-center text-sm leading-relaxed text-ink-400">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 fill-sage-500 text-sage-500" aria-hidden="true" />
        <span>
          We&apos;ll never share your email.
          <br />
          Your account is secure with us.
        </span>
      </p>
    </form>
  );
}
