"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle, CheckCircle2, User, Mail, Tag, PenLine, Send, ShieldCheck } from "lucide-react";
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
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-cream-50 p-8 text-center shadow-clay">
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
          className="mt-1 text-sm font-semibold text-ink-500 underline-offset-2 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl bg-cream-50 p-5 shadow-clay xs:p-6"
      noValidate
    >
      <p className="font-display text-xl font-semibold text-ink-700">Send us a message</p>
      <p className="mt-1 text-sm text-ink-400">Fill out the form below and we&apos;ll get back to you soon.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 xs:gap-4">
        <div>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
              className="store-input rounded-xl pl-10"
              placeholder="Your Name"
            />
          </div>
          {errors.name && <p className="mt-1.5 text-xs text-gold-700">{errors.name.message}</p>}
        </div>

        <div>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
              className="store-input rounded-xl pl-10"
              placeholder="Email Address"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-gold-700">{errors.email.message}</p>}
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
          <input
            id="contact-subject"
            type="text"
            aria-invalid={Boolean(errors.subject)}
            {...register("subject")}
            className="store-input rounded-xl pl-10"
            placeholder="Subject"
          />
        </div>
        {errors.subject && <p className="mt-1.5 text-xs text-gold-700">{errors.subject.message}</p>}
      </div>

      <div className="mt-4">
        <div className="relative">
          <PenLine className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-ink-300" aria-hidden="true" />
          <textarea
            id="contact-message"
            rows={5}
            aria-invalid={Boolean(errors.message)}
            {...register("message")}
            className="store-input resize-none rounded-xl py-3 pl-10"
            placeholder="How can we help you?"
          />
        </div>
        {errors.message && <p className="mt-1.5 text-xs text-gold-700">{errors.message.message}</p>}
      </div>

      {submitError && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3.5 py-2.5 text-sm text-gold-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <div className="mt-5 flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-500 px-6 py-3 text-sm font-semibold text-cream-50 shadow-clay-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-600 hover:shadow-lifted active:translate-y-0 active:scale-95 active:shadow-clay-pressed disabled:opacity-60 lg:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send Message
            </>
          )}
        </button>
        <p className="flex items-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden="true" />
          We respect your privacy.
        </p>
      </div>
    </form>
  );
}
