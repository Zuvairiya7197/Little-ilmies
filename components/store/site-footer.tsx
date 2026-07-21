import Link from "next/link";
import { Logo } from "@/components/store/logo";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Digital Delivery Policy", href: "/digital-delivery-policy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-beige-light">
      <div className="container-content flex flex-col items-center gap-5 py-10 text-center xs:py-12">
        <Logo />
        <p className="max-w-xs text-sm leading-relaxed text-ink-400">
          Authentic Islamic and educational e-books for young Muslim hearts.
        </p>

        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-ink-400 transition-colors hover:text-ink-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-ink-300">
          © {new Date().getFullYear()} Little Ilmies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
