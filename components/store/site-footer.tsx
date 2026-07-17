import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import { Logo } from "@/components/store/logo";
import { getAllCategories } from "@/lib/db/catalog";

const shopLinks = [
  { label: "All Books", href: "/shop" },
  { label: "Islamic E-Books", href: "/shop/islamic-books" },
  { label: "Educational E-Books", href: "/shop/educational-books" },
  { label: "Printable Activities", href: "/shop/coloring-books" },
  { label: "Bundles", href: "/shop?bundle=all" },
  { label: "Wishlist", href: "/wishlist" },
];

const supportLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "My Account", href: "/account" },
  { label: "Purchase History", href: "/account/purchase-history" },
  { label: "Downloads", href: "/account/downloads" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Digital Delivery Policy", href: "/digital-delivery-policy" },
];

export async function SiteFooter() {
  const categories = await getAllCategories();

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
                className="tap-target flex items-center justify-center rounded-full border-0 text-ink-400 shadow-clay-sm transition-all duration-200 hover:text-sage-600"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Little Ilmies on Facebook"
                className="tap-target flex items-center justify-center rounded-full border-0 text-ink-400 shadow-clay-sm transition-all duration-200 hover:text-sage-600"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="mailto:hello@littleilmies.com"
                aria-label="Email Little Ilmies"
                className="tap-target flex items-center justify-center rounded-full border-0 text-ink-400 shadow-clay-sm transition-all duration-200 hover:text-sage-600"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Customer Support" links={supportLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-10 border-t border-ink-100 pt-8">
          <p className="section-eyebrow mb-3">Popular Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="chip px-4 py-2 text-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
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
