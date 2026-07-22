import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Moon,
  Landmark,
  Languages,
  Palette,
  HandHeart,
  Star,
  Download,
  Printer,
  ShieldCheck,
  Heart,
  Lock,
  CreditCard,
  CheckCircle2,
  BookOpen,
  ShoppingBag,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/store/logo";

const shopLinks = [
  { label: "All Books", href: "/shop" },
  { label: "Islamic Collection", href: "/shop/islamic-books" },
  { label: "Educational Books", href: "/shop/educational-books" },
  { label: "Activities & Printables", href: "/shop/gifts-games" },
  { label: "Bundles & Offers", href: "/shop?bundle=all" },
  { label: "Best Sellers", href: "/shop?sort=bestselling" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
];

const popularTopics = [
  {
    label: "Ramadan Collection",
    href: "/shop/islamic-books",
    icon: Moon,
    bg: "bg-ink-50",
    color: "text-ink-500",
  },
  {
    label: "Stories of Prophets",
    href: "/shop/islamic-books",
    icon: Landmark,
    bg: "bg-sage-50",
    color: "text-sage-600",
  },
  {
    label: "Learning Arabic",
    href: "/shop/educational-books",
    icon: Languages,
    bg: "bg-teal-50",
    color: "text-teal-600",
  },
  {
    label: "Activities & Worksheets",
    href: "/shop/gifts-games",
    icon: Palette,
    bg: "bg-blossom-50",
    color: "text-blossom-500",
  },
  {
    label: "Duas & Adhkar",
    href: "/shop/islamic-books",
    icon: HandHeart,
    bg: "bg-ink-50",
    color: "text-ink-500",
  },
  {
    label: "Good Manners",
    href: "/shop/islamic-books",
    icon: Star,
    bg: "bg-sunny-50",
    color: "text-sunny-500",
  },
];

const helpLinks = [
  { label: "How It Works", href: "/about" },
  { label: "FAQs", href: "/contact" },
  { label: "Instant Download", href: "/digital-delivery-policy" },
  { label: "Printing Guide", href: "/digital-delivery-policy" },
  { label: "Terms of Use", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Contact Us", href: "/contact" },
];

const whyParents = [
  {
    label: "Instant Download",
    href: "/digital-delivery-policy",
    description: "Get your files right away",
    icon: Download,
    bg: "bg-ink-50",
    color: "text-ink-500",
  },
  {
    label: "Print at Home",
    href: "/digital-delivery-policy",
    description: "Easy to print and use",
    icon: Printer,
    bg: "bg-sage-50",
    color: "text-sage-600",
  },
  {
    label: "Trusted Content",
    href: "/about",
    description: "Authentic & beneficial",
    icon: ShieldCheck,
    bg: "bg-blossom-50",
    color: "text-blossom-500",
  },
  {
    label: "Made with Love",
    href: "/about",
    description: "For little Muslims",
    icon: Heart,
    bg: "bg-sunny-50",
    color: "text-sunny-500",
  },
];

const trustBadges = [
  {
    label: "Secure Checkout",
    description: "Your data is safe with us",
    icon: Lock,
    bg: "bg-ink-200",
    color: "text-ink-600",
  },
  {
    label: "Multiple Payment Options",
    description: "UPI, Cards, Netbanking & more",
    icon: CreditCard,
    bg: "bg-teal-100",
    color: "text-teal-700",
  },
  {
    label: "100% Satisfaction",
    description: "Love it or get support",
    icon: CheckCircle2,
    bg: "bg-blossom-100",
    color: "text-blossom-600",
  },
  {
    label: "Works on Any Device",
    description: "Read anywhere, anytime",
    icon: Download,
    bg: "bg-sunny-100",
    color: "text-sunny-700",
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/littleilmies",
    icon: Instagram,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919876543210",
    icon: MessageCircle,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/littleilmies",
    icon: Facebook,
  },
];

const paymentMethods = [
  "UPI",
  "VISA",
  "Mastercard",
  "RuPay",
  "Net Banking",
  "Paytm",
];

const mobileAccordions = [
  {
    label: "Shop",
    icon: ShoppingBag,
    iconBg: "bg-ink-100",
    iconColor: "text-ink-600",
    links: shopLinks,
  },
  {
    label: "Popular Topics",
    icon: Moon,
    iconBg: "bg-ink-100",
    iconColor: "text-ink-600",
    links: popularTopics.map(({ label, href }) => ({ label, href })),
  },
  {
    label: "Help",
    icon: HelpCircle,
    iconBg: "bg-ink-100",
    iconColor: "text-ink-600",
    links: helpLinks,
  },
  {
    label: "Why Parents Love Us",
    icon: Heart,
    iconBg: "bg-ink-100",
    iconColor: "text-ink-600",
    links: whyParents.map(({ label, href }) => ({ label, href: href ?? "#" })),
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-cream-50">
      {/* Mobile & tablet: illustration header + accordion sections + trust grid, distinct layout from desktop */}
      <div className="md:hidden">
        <div className="container-content pt-10 xs:pt-12">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Logo className="h-20 xs:h-24" />
              <p className="text-sm leading-relaxed text-ink-400">
                Islamic ebooks and activities for little hearts and curious
                minds. Read. Learn. Grow in Deen.
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink-500 shadow-clay-sm transition-all hover:-translate-y-0.5 hover:text-ink-700 hover:shadow-clay"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div className="relative -mr-2 h-56 w-40 shrink-0 xs:-mr-4 xs:h-64 xs:w-48">
              <Image
                src="/images/contact us.png"
                alt=""
                fill
                sizes="240px"
                className="scale-150 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-ink-100">
          {mobileAccordions.map(
            ({ label, icon: Icon, iconBg, iconColor, links }) => (
              <details key={label} className="group border-b border-ink-100">
                <summary className="tap-target container-content flex list-none items-center justify-between gap-3 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-display text-base font-bold text-ink-700">
                      {label}
                    </span>
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <nav
                  aria-label={label}
                  className="container-content flex flex-col gap-3 pb-5 pl-12"
                >
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-ink-500 transition-colors hover:text-ink-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </details>
            ),
          )}
        </div>

        <div className="container-content relative z-10 mt-8">
          <div className="grid grid-cols-4 gap-x-1 divide-x divide-ink-100 rounded-3xl bg-white p-4 shadow-clay-sm">
            {trustBadges.map(
              ({ label, description, icon: Icon, bg, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 px-1 text-center first:pl-0 last:pr-0"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold leading-tight text-ink-700">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-ink-400">
                      {description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="relative -mt-8 overflow-hidden rounded-t-[2.5rem] bg-ink-700">
          <Moon
            className="pointer-events-none absolute -right-8 top-10 h-32 w-32 text-ink-500/30"
            aria-hidden="true"
          />
          <Star
            className="pointer-events-none absolute right-14 top-6 h-3.5 w-3.5 fill-cream-50/40 text-cream-50/40"
            aria-hidden="true"
          />
          <div className="container-content relative flex flex-col gap-5 pb-8 pt-14 text-left">
            <div>
              <p className="text-sm text-cream-100">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-cream-50">
                  Little Ilmies
                </span>
                . All rights reserved.
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-cream-100">
                Made with{" "}
                <Heart
                  className="h-3.5 w-3.5 fill-blossom-400 text-blossom-400"
                  aria-hidden="true"
                />{" "}
                for little Muslims.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cream-200">
                We Accept
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-lg bg-cream-50 px-2.5 py-1.5 text-xs font-bold text-ink-600 shadow-soft"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: unchanged */}
      <div className="hidden md:block">
        <div className="container-content pb-0 pt-16">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
            <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
              <Logo className="h-20 xs:h-20 md:h-28 lg:h-32" />
              <p className="max-w-[220px] text-sm leading-relaxed text-ink-400">
                Islamic ebooks and activities for little hearts and curious
                minds. Read. Learn. Grow in Deen.
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink-500 shadow-clay-sm transition-all hover:-translate-y-0.5 hover:text-ink-700 hover:shadow-clay"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="font-display text-base font-bold text-ink-700">
                Shop
              </p>
              <nav aria-label="Shop" className="mt-4 flex flex-col gap-3">
                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-ink-500 transition-colors hover:text-ink-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="font-display text-base font-bold text-ink-700">
                Popular Topics
              </p>
              <nav
                aria-label="Popular topics"
                className="mt-4 flex flex-col gap-3.5"
              >
                {popularTopics.map(({ label, href, icon: Icon, bg, color }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-2.5 text-sm text-ink-500 transition-colors hover:text-ink-700"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="font-display text-base font-bold text-ink-700">
                Help
              </p>
              <nav aria-label="Help" className="mt-4 flex flex-col gap-3">
                {helpLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-ink-500 transition-colors hover:text-ink-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="col-span-2 md:col-span-1">
              <p className="font-display text-base font-bold text-ink-700">
                Why Parents Love Us
              </p>
              <div className="mt-4 flex flex-col gap-3.5">
                {whyParents.map(
                  ({ label, description, icon: Icon, bg, color }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink-700">
                          {label}
                        </p>
                        <p className="text-xs text-ink-400">{description}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 rounded-3xl bg-ink-100 p-6 shadow-clay-sm lg:rounded-full">
            <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-ink-200">
              {trustBadges.map(
                ({ label, description, icon: Icon, bg, color }, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 ${i > 0 ? "lg:pl-5" : ""}`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-700">
                        {label}
                      </p>
                      <p className="text-xs text-ink-400">{description}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="relative -mt-10 overflow-hidden rounded-t-[4rem] bg-ink-700">
          <Moon
            className="pointer-events-none absolute -right-6 top-1/2 h-40 w-40 -translate-y-1/2 text-ink-500/30"
            aria-hidden="true"
          />
          <Star
            className="pointer-events-none absolute right-24 top-8 h-4 w-4 fill-cream-50/40 text-cream-50/40"
            aria-hidden="true"
          />
          <Star
            className="pointer-events-none absolute right-52 top-16 h-3 w-3 fill-blossom-300/50 text-blossom-300/50"
            aria-hidden="true"
          />
          <div className="container-content relative flex items-center justify-between gap-6 pb-8 pt-16 text-left">
            <div>
              <p className="text-sm text-cream-100">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-cream-50">
                  Little Ilmies
                </span>
                . All rights reserved.
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-cream-100">
                Made with{" "}
                <Heart
                  className="h-3.5 w-3.5 fill-blossom-400 text-blossom-400"
                  aria-hidden="true"
                />{" "}
                for little Muslims.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cream-200">
                We Accept
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-lg bg-cream-50 px-2.5 py-1.5 text-xs font-bold text-ink-600 shadow-soft"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
