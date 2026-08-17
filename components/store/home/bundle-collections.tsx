"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift, CheckCircle2, ArrowRight, Languages, Heart, Landmark, Moon, Sparkles, Star, type LucideIcon } from "lucide-react";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { formatPrice } from "@/lib/utils/format";
import type { BundleSummary } from "@/types/catalog";

const BUNDLE_ICONS: Record<string, LucideIcon> = {
  "arabic-learning-bundle": Languages,
  "good-manners-bundle": Heart,
  "prophets-bundle": Landmark,
  "ramadan-bundle": Moon,
};

const BADGE_TINTS = ["bg-ink-100 text-ink-600", "bg-blossom-100 text-blossom-600", "bg-ink-100 text-ink-600", "bg-teal-100 text-teal-600"];
const SAVE_TINTS = ["bg-ink-600", "bg-blossom-500", "bg-ink-600", "bg-blossom-500"];

export function BundleCard({ bundle, index }: { bundle: BundleSummary; index: number }) {
  const currency = useCurrencyStore((s) => s.currency);
  const bundlePrice = resolveProductPrice(bundle, currency);
  const regularTotal = bundle.products.reduce((sum, product) => {
    const resolved = resolveProductPrice(product, bundlePrice.currencyCode);
    return sum + resolved.regularPrice;
  }, 0);
  const savings = Math.max(0, regularTotal - bundlePrice.regularPrice);
  const savingsPercent = regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0;
  const covers = bundle.products.slice(0, 3);
  const Icon = BUNDLE_ICONS[bundle.slug] ?? Gift;

  return (
    <Link
      href={`/shop?bundle=${bundle.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-cream-50 shadow-clay transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-sage-50 px-5 pt-6">
        <div className="absolute inset-x-8 bottom-0 h-16 rounded-t-[2rem] bg-cream-50/80 shadow-[0_-18px_45px_rgba(45,24,79,0.08)]" aria-hidden="true" />
        <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-blossom-100/60 blur-2xl" aria-hidden="true" />
        <div className="absolute right-10 bottom-8 h-24 w-24 rounded-full bg-sage-100/70 blur-2xl" aria-hidden="true" />
        {savingsPercent > 0 && (
          <span
            className={`absolute right-3 top-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream-50 shadow-soft ${SAVE_TINTS[index % SAVE_TINTS.length]}`}
          >
            Save {savingsPercent}%
          </span>
        )}
        <div className="absolute inset-x-5 bottom-3 flex h-32 items-end justify-center">
          {covers.map((product, i) => {
            const coverStyles = [
              "z-30 w-[5.7rem] -translate-x-8 rotate-[-5deg] group-hover:-translate-y-1.5 group-hover:rotate-[-7deg]",
              "z-20 w-[5.15rem] translate-x-8 -translate-y-1 rotate-[4deg] group-hover:-translate-y-2 group-hover:rotate-[6deg]",
              "z-10 w-[4.55rem] translate-x-16 translate-y-2 rotate-[10deg] opacity-95 group-hover:translate-x-[4.5rem]",
            ];

            return (
              <div
                key={product.id}
                className={`absolute aspect-[3/4] overflow-hidden rounded-[0.55rem] bg-cream-50 shadow-[0_14px_30px_rgba(45,24,79,0.18)] ring-1 ring-ink-100/20 transition-transform duration-300 ${coverStyles[i] ?? coverStyles[0]}`}
              >
                <div className="absolute inset-y-0 left-0 z-10 w-2 bg-gradient-to-r from-ink-700/20 via-ink-400/8 to-transparent" aria-hidden="true" />
                <div className="absolute inset-y-1 right-1 z-10 w-1 rounded-full bg-white/55" aria-hidden="true" />
                <Image src={product.coverImage} alt="" fill sizes="112px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-ink-700/8" aria-hidden="true" />
              </div>
            );
          })}
          <div className="absolute bottom-0 h-3 w-40 rounded-full bg-ink-500/10 blur-md" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${BADGE_TINTS[index % BADGE_TINTS.length]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold leading-snug text-ink-700 xs:text-lg">
              {bundle.name}
            </h3>
            {bundle.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-400 xs:text-sm">
                {bundle.description}
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sage-600">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {bundle.products.length} books included
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-ink-700">
              {formatPrice(bundlePrice.regularPrice, bundlePrice.currencyCode)}
            </span>
            {savings > 0 && (
              <span className="text-sm text-ink-300 line-through">
                {formatPrice(regularTotal, bundlePrice.currencyCode)}
              </span>
            )}
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-600 shadow-soft transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BundleCollections({ bundles }: { bundles: BundleSummary[] }) {
  if (bundles.length === 0) return null;

  return (
    <section aria-label="Bundle & save" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        {/* Mobile & tablet: single compact promo banner, matches app-style home design */}
        <Link
          href="/shop?bundle=all"
          className="group relative flex items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-700 to-ink-600 p-6 shadow-clay md:hidden"
        >
          <Sparkles className="absolute left-6 top-6 h-3.5 w-3.5 fill-cream-50/70 text-cream-50/70" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sunny-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Bundle &amp; Save
            </span>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-cream-50">
              Curated Bundle Collections
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-cream-100/80">
              Curated bundles that make learning more meaningful and savings
              even sweeter.
            </p>
            <span className="tap-target mt-4 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-blossom-500 px-4 py-2.5 text-sm font-semibold text-cream-50 shadow-soft transition-transform group-hover:translate-x-0.5">
              Explore Bundles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>

          <div className="relative aspect-[707/819] h-28 shrink-0 xs:h-32">
            <Star className="absolute -left-2 top-1 h-3.5 w-3.5 fill-sunny-400 text-sunny-400" aria-hidden="true" />
            <Star className="absolute -right-1 top-0 h-3 w-3 fill-cream-50/80 text-cream-50/80" aria-hidden="true" />
            <Image src="/images/explore-bundles.png" alt="" fill sizes="128px" className="object-contain" />
          </div>
        </Link>

        {/* Desktop: full heading + per-bundle card grid, unchanged */}
        <div className="mb-8 hidden max-w-lg md:block xs:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sage-700">
            <Gift className="h-3.5 w-3.5" aria-hidden="true" />
            Bundle &amp; Save
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Bundle Collections
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-400 xs:text-base">
            Curated bundles that make learning more meaningful and savings
            even sweeter.
          </p>
        </div>

        <div className="hidden grid-cols-1 gap-4 xs:grid-cols-2 md:grid lg:grid-cols-4">
          {bundles.map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
