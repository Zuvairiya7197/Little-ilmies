import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/store/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Little Ilmies — we're happy to help with orders, downloads, or general questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-content py-10 xs:py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-eyebrow">Get in touch</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-700 xs:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          Questions about an order, a download, or just want to say salaam? We&apos;d love to
          hear from you.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-600">Email</p>
              <a href="mailto:info@littleilmies.com" className="text-sm text-ink-400 hover:text-sage-700">
                info@littleilmies.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-600">Phone</p>
              <a href="tel:+919987448073" className="text-sm text-ink-400 hover:text-sage-700">
                +91 99874 48073
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-600">Location</p>
              <p className="text-sm text-ink-400">Maharashtra, India</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
