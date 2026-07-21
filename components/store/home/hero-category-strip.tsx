import Link from "next/link";
import Image from "next/image";
import { Moon, Languages, GraduationCap, PenTool, HandHeart, Star } from "lucide-react";

const mobileCategories = [
  { label: "Islamic", href: "/shop/islamic-books", icon: Moon, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Arabic", href: "/shop/arabic-for-kids", icon: Languages, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Educational", href: "/shop/educational-books", icon: GraduationCap, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Activities", href: "/shop/coloring-books", icon: PenTool, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Duas", href: "/shop/dua-and-prayers-for-kids", icon: HandHeart, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Best Sellers", href: "/shop?sort=bestselling", icon: Star, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
] as const;

const trustBadges: { label: string; image: string; iconBg: string; imageScale?: string }[] = [
  { label: "Authentic Islamic Content", image: "/images/why-authentic-content.png", iconBg: "bg-ink-50" },
  { label: "Instant Digital Download", image: "/images/why-instant-download.png", iconBg: "bg-sunny-50" },
  { label: "Printable PDF", image: "/images/why-print-at-home.png", iconBg: "bg-teal-50" },
  { label: "Kid Friendly", image: "/images/why-loved-by-parents.png", iconBg: "bg-blossom-50" },
  { label: "Easy To Read", image: "/images/why-easy-to-read.png", iconBg: "bg-sunny-50" },
  // Renders larger than the others at the same scale, so it gets a smaller override.
  { label: "Secure Checkout", image: "/images/why-secure-checkout.png", iconBg: "bg-ink-50", imageScale: "scale-100" },
];

export function HeroCategoryStrip() {
  return (
    <>
      {/* Mobile & tablet: category icon row + trust badges card, matches app-style home design */}
      <div className="relative z-10 -mt-6 md:hidden">
        <div className="container-content flex flex-col gap-4">
          <div className="grid grid-cols-6 gap-1.5 rounded-3xl bg-cream-50 p-3 shadow-lifted xs:gap-3 xs:p-4">
            {mobileCategories.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
              <Link
                key={label}
                href={href}
                className="tap-target flex flex-col items-center gap-1.5 xs:gap-2"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-100 xs:h-12 xs:w-12 ${iconBg} ${iconColor}`}>
                  <Icon className="h-4 w-4 xs:h-5 xs:w-5" aria-hidden="true" />
                </span>
                <span className="text-center text-[9.5px] font-semibold leading-tight text-ink-600 xs:text-[11px]">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-5 rounded-3xl bg-cream-50 p-4 shadow-lifted xs:p-5">
            {trustBadges.map(({ label, image, iconBg, imageScale }) => (
              <div key={label} className="flex items-center gap-1.5 xs:gap-2">
                <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Image src={image} alt="" fill sizes="32px" className={`object-contain ${imageScale ?? "scale-125"}`} />
                </span>
                <span className="text-xs font-semibold leading-tight text-ink-600 xs:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: compact image badge row, overlapping the hero above it */}
      <div className="relative z-10 -mt-24 hidden md:block">
        <div className="container-content">
          <div className="grid grid-cols-6 gap-4 rounded-3xl bg-cream-50 p-6 shadow-lifted">
            {trustBadges.map(({ label, image, iconBg, imageScale }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Image src={image} alt="" fill sizes="64px" className={`object-contain ${imageScale ?? "scale-125"}`} />
                </span>
                <span className="text-xs font-semibold leading-snug text-ink-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
