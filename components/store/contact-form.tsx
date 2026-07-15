"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "@/lib/validation/contact";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema) });

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setSubmitError("Could not send your message. Please try again.");
        return;
      }
      setSubmitted(true);
      reset();
    } catch {
      setSubmitError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-600">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-lg font-semibold text-ink-700">Message sent</p>
        <p className="max-w-xs text-sm text-ink-400">
          Thank you for reaching out — we&apos;ll get back to you soon, in shā&apos; Allāh.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-1 text-sm font-semibold text-sage-700 underline-offset-2 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface flex flex-col gap-4 p-5 xs:p-6" noValidate>
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
          className="store-input rounded-xl"
          placeholder="Your name"
        />
        {errors.name && <p className="mt-1.5 text-xs text-gold-700">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
          className="store-input rounded-xl"
          placeholder="you@example.com"
        />
        {errors.email && <p className="mt-1.5 text-xs text-gold-700">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-ink-600">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
          className="store-input resize-none rounded-xl py-3"
          placeholder="How can we help?"
        />
        {errors.message && <p className="mt-1.5 text-xs text-gold-700">{errors.message.message}</p>}
      </div>

      {submitError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60 xs:w-fit">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Send Message"}
      </button>
    </form>
  );
}
