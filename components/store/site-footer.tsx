import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import { Logo } from "@/components/store/logo";
import { categories } from "@/data/categories";

const shopLinks = [
  { label: "All Books", href: "/shop" },
  { label: "Islamic E-Books", href: "/shop/islamic-books" },
  { label: "Educational E-Books", href: "/shop/educational-books" },
  { label: "Gifts & Games", href: "/shop/gifts-games" },
  { label: "Wishlist", href: "/wishlist" },
];

const accountLinks = [
  { label: "My Account", href: "/account" },
  { label: "Purchase History", href: "/account/purchase-history" },
  { label: "Downloads", href: "/account/downloads" },
  { label: "Login", href: "/login" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Digital Delivery Policy", href: "/digital-delivery-policy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-beige-light">
      <div className="container-content py-12 xs:py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 xs:grid-cols-2 md:grid-cols-5">
          <div className="xs:col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
              Little Ilmies helps Muslim parents nurture young hearts with
              authentic Islamic and educational e-books — instantly
              downloadable, beautifully illustrated, and made for little
              learners.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Little Ilmies on Instagram"
                className="tap-target flex items-center justify-center rounded-full border border-ink-100 text-ink-400 transition-colors hover:border-sage-300 hover:text-sage-600"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Little Ilmies on Facebook"
                className="tap-target flex items-center justify-center rounded-full border border-ink-100 text-ink-400 transition-colors hover:border-sage-300 hover:text-sage-600"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="mailto:hello@littleilmies.com"
                aria-label="Email Little Ilmies"
                className="tap-target flex items-center justify-center rounded-full border border-ink-100 text-ink-400 transition-colors hover:border-sage-300 hover:text-sage-600"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Account" links={accountLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-10 border-t border-ink-100 pt-8">
          <p className="section-eyebrow mb-3">Popular Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="tap-target rounded-full border border-ink-100 bg-cream-50 px-4 py-2 text-xs font-medium text-ink-500 transition-colors hover:border-sage-300 hover:bg-sage-50"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-ink-100 bg-cream-50 p-6 xs:flex xs:items-center xs:justify-between xs:gap-6">
          <div>
            <p className="font-display text-lg font-semibold text-ink-600">
              Join our newsletter
            </p>
            <p className="mt-1 text-sm text-ink-400">
              New releases and gentle reminders, straight to your inbox.
            </p>
          </div>
          <form className="mt-4 flex gap-2 xs:mt-0 xs:w-72" aria-label="Newsletter signup">
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="tap-target min-w-0 flex-1 rounded-full border border-ink-100 bg-cream-100 px-4 text-sm text-ink-600 placeholder:text-ink-300 focus-visible:border-sage-400"
            />
            <button type="submit" className="btn-primary shrink-0 px-5">
              Join
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-2 text-xs text-ink-300 xs:flex-row xs:items-center xs:justify-between">
          <p>© {new Date().getFullYear()} Little Ilmies. All rights reserved.</p>
          <p>Made with care for Muslim families everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="section-eyebrow mb-4">{title}</p>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ink-400 transition-colors hover:text-ink-700"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
