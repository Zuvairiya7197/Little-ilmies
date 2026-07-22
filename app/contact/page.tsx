import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Send, Headset, Mail, MessageCircle, Clock, MapPin, HelpCircle, BookOpen, Sparkle } from "lucide-react";
import { ContactForm } from "@/components/store/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Little Ilmies — we're happy to help with orders, downloads, or general questions.",
  alternates: { canonical: "/contact" },
};

const otherWays = [
  {
    label: "Email Us",
    icon: Mail,
    bg: "bg-blossom-100",
    color: "text-blossom-500",
    labelColor: "text-blossom-500",
    lines: ["hello@littleilmies.com", "We're here to help!"],
    href: "mailto:hello@littleilmies.com",
  },
  {
    label: "WhatsApp",
    icon: MessageCircle,
    bg: "bg-sage-100",
    color: "text-sage-600",
    labelColor: "text-sage-600",
    lines: ["+91 98765 43210", "Mon – Sat, 10 AM – 6 PM"],
    href: "https://wa.me/919876543210",
  },
  {
    label: "Business Hours",
    icon: Clock,
    bg: "bg-blossom-100",
    color: "text-blossom-600",
    labelColor: "text-blossom-600",
    lines: ["Mon – Sat: 10 AM – 6 PM", "Sunday: Closed"],
  },
  {
    label: "Our Location",
    icon: MapPin,
    bg: "bg-sunny-100",
    color: "text-sunny-600",
    labelColor: "text-sunny-600",
    lines: ["India", "Serving little Muslims worldwide 💜"],
  },
];

export default function ContactPage() {
  return (
    <div className="bg-cream">
      {/* Mobile & tablet: stacked single-column layout, distinct from desktop's 3-col grid */}
      <div className="lg:hidden">
        <div className="container-content py-10 xs:py-12">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="section-eyebrow inline-flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                Contact Us
              </p>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-ink-700 xs:text-4xl">
                We&apos;re Here <br />
                To Help You
                <span className="relative inline-block h-6 w-6 shrink-0 overflow-hidden align-middle xs:h-9 xs:w-9" aria-hidden="true">
                  <Image src="/images/heart.png" alt="" fill sizes="36px" className="scale-[3.2] object-contain" />
                </span>
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-ink-300" aria-hidden="true" />
              <p className="mt-5 text-base leading-relaxed text-ink-400">
                Have a question, suggestion, or need help? We&apos;d love to hear from you!
              </p>
            </div>

            <div className="relative -mr-6 h-40 w-24 shrink-0 xs:h-48 xs:w-40">
              <Image src="/images/contact us.png" alt="" fill sizes="200px" className="scale-[1.6] object-contain" />
            </div>
          </div>

          <div className="relative mt-6 inline-flex items-center gap-3 rounded-2xl bg-cream-50 py-3 pl-3 pr-5 shadow-clay-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-500">
              <Headset className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-ink-400">We usually reply within</p>
              <p className="font-display text-base font-bold text-ink-700">24 hours</p>
            </div>
            <span className="absolute -right-3 bottom-2 h-5 w-5 overflow-hidden" aria-hidden="true">
              <Image src="/images/star.png" alt="" fill sizes="20px" className="scale-150 object-contain" />
            </span>
          </div>

          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <div className="container-content pb-10 xs:pb-12">
          <div className="flex items-center justify-center gap-2">
            <Sparkle className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-ink-700 xs:text-2xl">Other Ways To Reach Us</h2>
            <Sparkle className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xs:grid-cols-2">
            {otherWays.map(({ label, icon: Icon, bg, color, labelColor, lines, href }) => {
              const content = (
                <div className="flex h-full items-start gap-3 rounded-2xl bg-ink-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-sm">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${labelColor}`}>{label}</p>
                    {lines.map((line) => (
                      <p key={line} className="mt-0.5 text-sm text-ink-400">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} className="block">
                  {content}
                </a>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-ink-100 p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-24 shrink-0">
                <Image
                  src="/images/cant find what you are looking for.png"
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-ink-700">
                  Can&apos;t find what you&apos;re looking for?
                </p>
                <p className="mt-1 text-sm text-ink-400">
                  Check out our FAQs or browse our Help Center for quick answers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="tap-target inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-cream-50 px-4 py-2.5 text-sm font-semibold text-ink-600 shadow-clay-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay active:translate-y-0 active:scale-95"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                View FAQs
              </Link>
              <Link
                href="/about"
                className="tap-target inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink-500 px-4 py-2.5 text-sm font-semibold text-cream-50 shadow-clay-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-600 hover:shadow-lifted active:translate-y-0 active:scale-95"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: unchanged */}
      <div className="hidden lg:block">
        <div className="container-content py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_0.8fr_1.1fr] lg:items-center">
            <div>
              <p className="section-eyebrow inline-flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                Contact Us
              </p>
              <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-ink-700">
                We&apos;re Here <br />
                <span className="inline-flex items-center gap-2">
                  To Help You
                  <span className="relative inline-block h-11 w-11 shrink-0 overflow-hidden" aria-hidden="true">
                    <Image src="/images/heart.png" alt="" fill sizes="44px" className="scale-[3.2] object-contain" />
                  </span>
                </span>
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-ink-300" aria-hidden="true" />
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-400">
                Have a question, suggestion, or need help? We&apos;d love to hear from you!
              </p>

              <div className="relative mt-6 inline-flex items-center gap-3 rounded-2xl bg-cream-50 py-3 pl-3 pr-5 shadow-clay-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-500">
                  <Headset className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-ink-400">We usually reply within</p>
                  <p className="font-display text-base font-bold text-ink-700">24 hours</p>
                </div>
                <span className="absolute -right-3 bottom-2 h-5 w-5 overflow-hidden" aria-hidden="true">
                  <Image src="/images/star.png" alt="" fill sizes="20px" className="scale-150 object-contain" />
                </span>
              </div>
            </div>

            <div className="relative aspect-[3/2] w-full">
              <Image src="/images/contact us.png" alt="" fill sizes="640px" className="object-contain scale-[1.8]" />
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>

        <div className="border-t border-ink-100 bg-cream-50 py-16">
          <div className="container-content">
            <div className="flex items-center justify-center gap-2">
              <Sparkle className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold text-ink-700">Other Ways To Reach Us</h2>
              <Sparkle className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
              {otherWays.map(({ label, icon: Icon, bg, color, labelColor, lines, href }) => {
                const content = (
                  <div className="flex h-full items-start gap-3 rounded-2xl bg-ink-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-sm">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className={`text-sm font-bold ${labelColor}`}>{label}</p>
                      {lines.map((line) => (
                        <p key={line} className="mt-0.5 text-sm text-ink-400">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
                return href ? (
                  <a key={label} href={href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={label}>{content}</div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-row items-center gap-2 rounded-3xl bg-ink-100 p-2 py-0 pl-2 pr-3 text-left">
              <div className="relative -mt-14 h-40 w-56 shrink-0">
                <Image
                  src="/images/cant find what you are looking for.png"
                  alt=""
                  fill
                  sizes="208px"
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="mr-8 flex-1">
                <p className="font-display text-base font-bold text-ink-700">
                  Can&apos;t find what you&apos;re looking for?
                </p>
                <p className="mt-1 text-sm text-ink-400">
                  Check out our FAQs or browse our Help Center for quick answers.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href="/contact"
                  className="tap-target inline-flex items-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-sm font-semibold text-ink-600 shadow-clay-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay active:translate-y-0 active:scale-95"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  View FAQs
                </Link>
                <Link
                  href="/about"
                  className="tap-target inline-flex items-center gap-2 rounded-full bg-ink-500 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-clay-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-600 hover:shadow-lifted active:translate-y-0 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
