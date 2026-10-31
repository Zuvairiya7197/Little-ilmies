"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  Clock,
  Download,
  Globe2,
  Heart,
  Home,
  MonitorSmartphone,
  Palette,
  Printer,
  Repeat,
  ShoppingCart,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { useProductEntitlement } from "@/hooks/use-product-entitlement";
import { useRentalEligible } from "@/hooks/use-rental-eligible";
import { resolveProductPrice, type ResolvedPrice } from "@/lib/pricing/resolve-price";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import {
  FORMAT_DETAILS,
  FORMAT_URL_PARAM,
  downloadHref,
  formatFromUrlParam,
  isPdfFormat,
  type PdfFormat,
} from "@/lib/formats";
import type { BookFormat, ProductDetail, ProductVariant } from "@/types/catalog";

const FORMAT_ICON: Record<BookFormat, { icon: LucideIcon; tint: string }> = {
  COLOUR_PDF: { icon: Palette, tint: "bg-blossom-50 text-blossom-600" },
  BW_PDF: { icon: Printer, tint: "bg-ink-50 text-ink-500" },
  RENT_AND_READ: { icon: BookOpen, tint: "bg-teal-50 text-teal-700" },
};

const BENEFIT_ICONS: Record<BookFormat, LucideIcon[]> = {
  COLOUR_PDF: [Download, Home, Repeat],
  BW_PDF: [Download, Printer, Repeat],
  RENT_AND_READ: [MonitorSmartphone, Ban, Globe2],
};

interface ProductFormatSelectorProps {
  product: ProductDetail;
}

/**
 * Format cards + pricing panel for the product page. Only the formats this
 * book actually offers are shown (product.variants is already filtered
 * server-side to enabled, complete formats); Rent & Read additionally needs
 * an India visitor. Hardcover is a separate, inert "Coming Soon" card that
 * can never be selected or priced.
 */
export function ProductFormatSelector({ product }: ProductFormatSelectorProps) {
  const router = useRouter();
  const rentalEligible = useRentalEligible();
  const { ownedFormats, activeRentalExpiresAt } = useProductEntitlement(product.id);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const currency = useCurrencyStore((s) => s.currency);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));

  const isRenting = Boolean(activeRentalExpiresAt);
  const ownsAnyPdf = ownedFormats.length > 0;

  const variants = useMemo(
    () =>
      product.variants.filter((variant) => {
        if (variant.format !== "RENT_AND_READ") return true;
        // An active rental stays visible so the buyer can get back to the
        // reader; otherwise renting needs an India visitor and makes no
        // sense once a PDF is already owned.
        return isRenting || (rentalEligible && !ownsAnyPdf);
      }),
    [product.variants, rentalEligible, isRenting, ownsAnyPdf]
  );
  const firstPdfVariant = variants.find((variant) => isPdfFormat(variant.format));

  const [selectedFormat, setSelectedFormat] = useState<BookFormat | null>(variants[0]?.format ?? null);
  const selected = variants.find((variant) => variant.format === selectedFormat) ?? variants[0] ?? null;

  // Restore the format chosen earlier: an explicit ?format= in the URL
  // (cart links, back button) wins, then whatever is already in the cart.
  // Waits for the visitor's country, since that decides whether the Rent &
  // Read format is on offer at all.
  useEffect(() => {
    if (rentalEligible === null) return;
    const fromUrl = formatFromUrlParam(new URLSearchParams(window.location.search).get("format"));
    const inCart = cartItems.find((item) => item.productId === product.id && item.type !== "CUSTOM_BUNDLE");
    const fromCart: BookFormat | undefined = inCart
      ? inCart.type === "RENTAL"
        ? "RENT_AND_READ"
        : (inCart.format ?? "COLOUR_PDF")
      : undefined;
    const restored = [fromUrl, fromCart].find((format) => variants.some((v) => v.format === format));
    if (restored) setSelectedFormat(restored);
    // Not on cart changes — those must not move the selection. An active
    // rental arrives after mount and can add the format to the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentalEligible, isRenting]);

  function selectFormat(format: BookFormat) {
    setSelectedFormat(format);
    const url = new URL(window.location.href);
    url.searchParams.set("format", FORMAT_URL_PARAM[format]);
    window.history.replaceState(window.history.state, "", url);
  }

  function cartBase() {
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      coverImage: product.coverImage,
      pageCount: product.pageCount,
      isBestseller: product.isBestseller,
      isNewArrival: product.isNewArrival,
    };
  }

  function addPdfToCart(variant: ProductVariant & { format: PdfFormat }) {
    addItem({ ...cartBase(), format: variant.format, prices: variant.prices });
  }

  function rentNow(variant: ProductVariant) {
    addItem({
      ...cartBase(),
      type: "RENTAL",
      cartItemId: `rental:${product.id}`,
      prices: firstPdfVariant?.prices ?? product.prices,
      rentalPrice: variant.rentalPrice,
      rentalDurationDays: variant.rentalDurationDays,
    });
    router.push("/checkout");
  }

  function upgradeNow(variant: ProductVariant & { format: PdfFormat }) {
    addItem({
      ...cartBase(),
      type: "UPGRADE",
      cartItemId: `upgrade:${product.id}`,
      format: variant.format,
      prices: variant.prices,
      rentalPrice: product.variants.find((v) => v.format === "RENT_AND_READ")?.rentalPrice,
    });
    router.push("/checkout");
  }

  const showHardcover = product.showHardcoverComingSoon === true;
  const cardCount = variants.length + (showHardcover ? 1 : 0);

  return (
    <section aria-labelledby="formats-heading" className="mt-6 lg:mt-7">
      <h2 id="formats-heading" className="font-display text-lg font-bold text-ink-700 sm:text-xl">
        {variants.length > 1 ? "Available Formats" : "Format"}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby="formats-heading"
        className={cn(
          "mt-3 grid gap-3",
          cardCount === 1 ? "grid-cols-1 xs:max-w-xs" : "grid-cols-2",
          cardCount >= 3 && "lg:grid-cols-[repeat(auto-fit,minmax(8.25rem,1fr))]"
        )}
      >
        {variants.map((variant) => (
          <FormatCard
            key={variant.id}
            productId={product.id}
            variant={variant}
            selected={selected?.format === variant.format}
            onSelect={() => selectFormat(variant.format)}
            currency={currency}
            status={
              isPdfFormat(variant.format) && ownedFormats.includes(variant.format)
                ? "Owned"
                : variant.format === "RENT_AND_READ" && isRenting
                  ? "Renting"
                  : undefined
            }
          />
        ))}

        {showHardcover && (
          <div
            aria-disabled="true"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink-100 bg-cream-100/60 px-3 py-4 text-center"
          >
            <BookOpenCheck className="h-6 w-6 text-ink-200" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-300">Hardcover Book</p>
            <span className="rounded-full bg-ink-50 px-2.5 py-0.5 text-[11px] font-semibold text-ink-400">
              Coming Soon
            </span>
            <span className="sr-only">Physical books are coming soon and can&apos;t be ordered yet.</span>
          </div>
        )}
      </div>

      {selected ? (
        <PricingPanel
          product={product}
          variant={selected}
          currency={currency}
          owned={isPdfFormat(selected.format) && ownedFormats.includes(selected.format)}
          activeRentalExpiresAt={activeRentalExpiresAt}
          upgradeVariant={
            firstPdfVariant && isPdfFormat(firstPdfVariant.format) && !ownsAnyPdf
              ? (firstPdfVariant as ProductVariant & { format: PdfFormat })
              : undefined
          }
          isWishlisted={isWishlisted}
          onToggleWishlist={() =>
            toggleWishlist({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              coverImage: product.coverImage,
            })
          }
          onAddToCart={addPdfToCart}
          onBuyNow={(variant) => {
            addPdfToCart(variant);
            router.push("/checkout");
          }}
          onRent={rentNow}
          onUpgrade={upgradeNow}
        />
      ) : (
        <div className="mt-5 rounded-3xl bg-cream-50 p-5 text-sm text-ink-500 shadow-clay-sm">
          This book isn&apos;t available to buy right now. Please check back soon.
        </div>
      )}
    </section>
  );
}

function variantPrice(variant: ProductVariant, currency: Parameters<typeof resolveProductPrice>[1]): ResolvedPrice | null {
  if (variant.format === "RENT_AND_READ") {
    return variant.rentalPrice == null
      ? null
      : {
          currencyCode: RENTAL_CURRENCY_CODE,
          regularPrice: variant.rentalPrice,
          isFallback: false,
          isEmergencyFallback: false,
        };
  }
  try {
    return resolveProductPrice(variant, currency);
  } catch {
    return null;
  }
}

function FormatCard({
  productId,
  variant,
  selected,
  onSelect,
  currency,
  status,
}: {
  productId: string;
  variant: ProductVariant;
  selected: boolean;
  onSelect: () => void;
  currency: Parameters<typeof resolveProductPrice>[1];
  status?: "Owned" | "Renting";
}) {
  const details = FORMAT_DETAILS[variant.format];
  const { icon: Icon, tint } = FORMAT_ICON[variant.format];
  const price = variantPrice(variant, currency);
  const tagline =
    variant.format === "RENT_AND_READ"
      ? `Read online for ${variant.rentalDurationDays ?? 7} days (no PDF download)`
      : details.tagline;

  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 bg-cream-50 px-3 py-4 text-center transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-400 has-[:focus-visible]:ring-offset-2",
        selected
          ? "border-violet-600 shadow-[0_10px_30px_rgba(91,33,182,0.14)]"
          : "border-ink-100 shadow-soft hover:-translate-y-0.5 hover:border-violet-200"
      )}
    >
      <input
        type="radio"
        name={`format-${productId}`}
        value={variant.format}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-cream-50">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        </span>
      )}
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", tint)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-bold leading-snug text-ink-700">{details.name}</span>
      <span className="text-xs leading-snug text-ink-400">{tagline}</span>
      {status ? (
        <span className="mt-0.5 rounded-full bg-sage-50 px-2.5 py-0.5 text-[11px] font-bold text-sage-700">{status}</span>
      ) : (
        price && (
          <span className="mt-0.5 text-sm font-semibold text-violet-700">
            {formatPrice(price.salePrice ?? price.regularPrice, price.currencyCode)}
          </span>
        )
      )}
    </label>
  );
}

function PricingPanel({
  product,
  variant,
  currency,
  owned,
  activeRentalExpiresAt,
  upgradeVariant,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onRent,
  onUpgrade,
}: {
  product: ProductDetail;
  variant: ProductVariant;
  currency: Parameters<typeof resolveProductPrice>[1];
  owned: boolean;
  activeRentalExpiresAt: string | null;
  upgradeVariant?: ProductVariant & { format: PdfFormat };
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: (variant: ProductVariant & { format: PdfFormat }) => void;
  onBuyNow: (variant: ProductVariant & { format: PdfFormat }) => void;
  onRent: (variant: ProductVariant) => void;
  onUpgrade: (variant: ProductVariant & { format: PdfFormat }) => void;
}) {
  const details = FORMAT_DETAILS[variant.format];
  const price = variantPrice(variant, currency);
  const benefits = details.benefits(variant);
  const benefitIcons = BENEFIT_ICONS[variant.format];
  const isRental = variant.format === "RENT_AND_READ";
  const pdfVariant = isPdfFormat(variant.format) ? (variant as ProductVariant & { format: PdfFormat }) : null;
  const renting = isRental && Boolean(activeRentalExpiresAt);
  const formatLabel = isRental ? `${details.name} · ${variant.rentalDurationDays ?? 7} days` : details.name;
  const discountPercent =
    price?.salePrice != null && price.salePrice < price.regularPrice
      ? Math.round((1 - price.salePrice / price.regularPrice) * 100)
      : 0;

  // Display-only upgrade estimate; create-order credits what was really paid.
  const upgradePrice = (() => {
    if (!renting || !upgradeVariant || variant.rentalPrice == null) return null;
    const inr = variantPrice(upgradeVariant, RENTAL_CURRENCY_CODE);
    if (!inr || inr.currencyCode !== RENTAL_CURRENCY_CODE) return null;
    return Math.max(0, (inr.salePrice ?? inr.regularPrice) - variant.rentalPrice);
  })();

  return (
    <div className="mt-5 rounded-3xl bg-cream-50 p-5 shadow-clay sm:p-6" aria-live="polite">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {owned ? (
            <p className="flex items-center gap-2 font-display text-xl font-semibold text-sage-700">
              <Check className="h-5 w-5" aria-hidden="true" />
              You own this format
            </p>
          ) : renting ? (
            <p className="flex items-center gap-2 font-display text-xl font-semibold text-sage-700">
              <Clock className="h-5 w-5" aria-hidden="true" />
              You&apos;re renting this book
            </p>
          ) : price ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-4xl font-bold leading-none text-ink-700">
                {formatPrice(price.salePrice ?? price.regularPrice, price.currencyCode)}
                {price.isFallback && <span className="ml-1 text-base">{price.currencyCode}</span>}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-lg text-ink-300 line-through">
                    {formatPrice(price.regularPrice, price.currencyCode)}
                  </span>
                  <span className="rounded-lg bg-blossom-50 px-2 py-0.5 text-xs font-bold text-blossom-600">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          ) : null}
          <p className="mt-2 text-sm font-medium text-ink-500">{formatLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:min-w-[13rem]">
          {owned && pdfVariant ? (
            <a href={downloadHref(product.id, pdfVariant.format)} className="btn-primary w-full bg-violet-700 py-3.5 text-base hover:bg-violet-800">
              <Download className="h-5 w-5" aria-hidden="true" />
              Download
            </a>
          ) : renting ? (
            <Link href={`/read/${product.id}`} className="btn-primary w-full bg-violet-700 py-3.5 text-base hover:bg-violet-800">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Read Now
            </Link>
          ) : isRental ? (
            <button
              type="button"
              onClick={() => onRent(variant)}
              className="btn-primary w-full bg-violet-700 py-3.5 text-base hover:bg-violet-800"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Rent &amp; Read
            </button>
          ) : (
            pdfVariant && (
              <button
                type="button"
                onClick={() => onAddToCart(pdfVariant)}
                className="btn-primary w-full bg-violet-700 py-3.5 text-base hover:bg-violet-800"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                Add to Cart
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )
          )}
          {!owned && !renting && (
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="tap-target flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-100 shadow-clay-sm transition-transform active:scale-95"
            >
              <Heart
                className={cn("h-5 w-5", isWishlisted ? "fill-blossom-500 text-blossom-500" : "text-ink-400")}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      {pdfVariant && !owned && (
        <button
          type="button"
          onClick={() => onBuyNow(pdfVariant)}
          className="mt-3 w-full text-center text-sm font-semibold text-violet-700 underline-offset-4 hover:underline sm:text-right"
        >
          Buy now and go to checkout
        </button>
      )}

      {renting && activeRentalExpiresAt && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-500">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Access expires on{" "}
          {new Date(activeRentalExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      )}

      <ul className="mt-5 grid gap-3 border-t border-ink-100 pt-5 sm:grid-cols-3">
        {benefits.map((benefit, index) => {
          const Icon = benefitIcons[index] ?? Check;
          return (
            <li key={benefit} className="flex items-start gap-2.5 text-sm leading-snug text-ink-500 sm:flex-col sm:items-center sm:text-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {benefit}
            </li>
          );
        })}
      </ul>

      {renting && upgradeVariant && upgradePrice != null && (
        <div className="mt-5 rounded-2xl border border-sage-200 bg-sage-50 p-4">
          <p className="text-sm font-semibold text-ink-700">Want to keep this book?</p>
          <p className="mt-1 text-xs text-ink-500">
            Buy the {FORMAT_DETAILS[upgradeVariant.format].name} and keep permanent download access. What you paid
            for the rental is credited toward the purchase.
          </p>
          <button type="button" onClick={() => onUpgrade(upgradeVariant)} className="btn-primary mt-3 w-full justify-center">
            Upgrade for {formatPrice(upgradePrice, RENTAL_CURRENCY_CODE)}
          </button>
        </div>
      )}

      {price?.isFallback && !owned && !renting && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Regional pricing is not available for your location, so checkout will use the clearly labelled{" "}
            {price.currencyCode} price shown here.
          </span>
        </p>
      )}
    </div>
  );
}
