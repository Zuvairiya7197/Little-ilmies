"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  BookOpenCheck,
  Download,
  Printer,
  Baby,
  BookOpen,
  ShieldCheck,
  Moon,
  Languages,
  GraduationCap,
  PenTool,
  HandHeart,
  Star,
} from "lucide-react";

const strip = [
  { label: "Authentic Islamic Content", href: "/shop/islamic-books", icon: BookOpenCheck, iconBg: "bg-ink-50", iconColor: "text-ink-600", textColor: "text-ink-600" },
  { label: "Instant Digital Download", href: "/shop", icon: Download, iconBg: "bg-sunny-50", iconColor: "text-sunny-600", textColor: "text-sunny-600" },
  { label: "Printable PDF", href: "/shop/coloring-books", icon: Printer, iconBg: "bg-lemon-50", iconColor: "text-lemon-600", textColor: "text-lemon-600" },
  { label: "Kid Friendly", href: "/shop", icon: Baby, iconBg: "bg-teal-50", iconColor: "text-teal-600", textColor: "text-teal-600" },
  { label: "Easy To Read", href: "/shop", icon: BookOpen, iconBg: "bg-blossom-50", iconColor: "text-blossom-500", textColor: "text-blossom-500" },
  { label: "Secure Checkout", href: "/checkout", icon: ShieldCheck, iconBg: "bg-sage-50", iconColor: "text-sage-600", textColor: "text-sage-600" },
] as const;

const mobileCategories = [
  { label: "Islamic", href: "/shop/islamic-books", icon: Moon, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Arabic", href: "/shop/arabic-for-kids", icon: Languages, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Educational", href: "/shop/educational-books", icon: GraduationCap, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Activities", href: "/shop/coloring-books", icon: PenTool, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Duas", href: "/shop/dua-and-prayers-for-kids", icon: HandHeart, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
  { label: "Best Sellers", href: "/shop?sort=bestselling", icon: Star, iconBg: "bg-cream-50", iconColor: "text-ink-400" },
] as const;

const mobileBadges = [
  { label: "Instant Download", icon: Download, iconBg: "bg-ink-50", iconColor: "text-ink-500" },
  { label: "Printable at Home", icon: Printer, iconBg: "bg-sage-50", iconColor: "text-sage-600" },
  { label: "Kid Friendly", icon: Baby, iconBg: "bg-teal-50", iconColor: "text-teal-600" },
  { label: "Authentic Content", icon: BookOpenCheck, iconBg: "bg-sunny-50", iconColor: "text-sunny-600" },
  { label: "Easy to Read", icon: BookOpen, iconBg: "bg-blossom-50", iconColor: "text-blossom-500" },
  { label: "Secure Checkout", icon: ShieldCheck, iconBg: "bg-sage-50", iconColor: "text-sage-600" },
] as const;

export function HeroCategoryStrip() {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  function scrollByAmount() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.7, behavior: "smooth" });
  }

  return (
    <>
      {/* Mobile & tablet: category icon row + trust badges card, matches app-style home design */}
      <div className="relative z-10 -mt-6 md:hidden">
        <div className="container-content flex flex-col gap-4">
          <div className="grid grid-cols-6 gap-2 rounded-3xl bg-cream-50 p-4 shadow-lifted xs:gap-3">
            {mobileCategories.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
              <Link
                key={label}
                href={href}
                className="tap-target flex flex-col items-center gap-2"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink-100 ${iconBg} ${iconColor}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-center text-[11px] font-semibold leading-tight text-ink-600">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-5 rounded-3xl bg-cream-50 p-4 shadow-lifted xs:p-5">
            {mobileBadges.map(({ label, icon: Icon, iconBg, iconColor }) => (
              <div key={label} className="flex items-center gap-1.5 xs:gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold leading-tight text-ink-600 xs:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: horizontal scrolling trust strip, unchanged */}
      <div className="relative z-10 hidden md:block">
        <div className="container-content">
          <div className="flex items-center gap-2 rounded-3xl bg-cream-50 p-3 shadow-lifted">
            <ul
              ref={scrollerRef}
              className="flex flex-1 snap-x snap-mandatory gap-2.5 overflow-x-auto no-scrollbar"
            >
              {strip.map(({ label, href, icon: Icon, iconBg, iconColor, textColor }) => (
                <li key={label} className="shrink-0 snap-start">
                  <Link
                    href={href}
                    className="tap-target flex items-center gap-2.5 rounded-2xl border border-ink-100 bg-cream-50 px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-sm"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
                    </span>
                    <span className={`whitespace-nowrap text-sm font-bold leading-tight ${textColor}`}>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {canScrollRight && (
              <button
                type="button"
                onClick={scrollByAmount}
                aria-label="Scroll for more"
                className="tap-target hidden shrink-0 items-center justify-center rounded-full bg-cream-50 text-ink-500 shadow-clay-sm md:flex"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
