"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import type { ProductSummary } from "@/types/catalog";

export interface RentalUpgradeInfo {
  price: number;
  rentalPricePaid: number;
  productSlug: string;
  coverImage: string;
  prices: ProductSummary["prices"];
  ageRange: ProductSummary["ageRange"];
  pageCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
}

interface RentalReaderProps {
  productId: string;
  title: string;
  pageCount: number;
  expiresAt: string; // ISO
  watermarkLabel: string;
  upgrade: RentalUpgradeInfo | null;
}

const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2];

function formatDaysRemaining(expiresAt: string) {
  const msRemaining = new Date(expiresAt).getTime() - Date.now();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  if (daysRemaining <= 0) return "Expires soon";
  if (daysRemaining === 1) return "Expires tomorrow";
  return `${daysRemaining} days remaining`;
}

const SWIPE_THRESHOLD_PX = 50;

export function RentalReader({ productId, title, pageCount, expiresAt, watermarkLabel, upgrade }: RentalReaderProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remainingLabel, setRemainingLabel] = useState(() => formatDaysRemaining(expiresAt));
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const touchStartX = useRef<number | null>(null);

  function upgradeNow() {
    if (!upgrade) return;
    addItem({
      type: "UPGRADE",
      cartItemId: `upgrade:${productId}`,
      productId,
      slug: upgrade.productSlug,
      title,
      coverImage: upgrade.coverImage,
      prices: upgrade.prices,
      ageRange: upgrade.ageRange,
      pageCount: upgrade.pageCount,
      isBestseller: upgrade.isBestseller,
      isNewArrival: upgrade.isNewArrival,
    });
    router.push("/checkout");
  }

  const zoom = ZOOM_STEPS[zoomStep];

  const goToPage = useCallback(
    (next: number) => {
      setPageIndex(Math.min(Math.max(next, 0), pageCount - 1));
    },
    [pageCount]
  );

  function onTouchStart(event: React.TouchEvent) {
    // Swiping to change pages only makes sense at 1x zoom — zoomed in, a
    // horizontal drag needs to pan/scroll across the image instead, so
    // it'd fight with page navigation otherwise.
    touchStartX.current = zoom === 1 ? event.touches[0].clientX : null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX < 0) goToPage(pageIndex + 1);
    else goToPage(pageIndex - 1);
  }

  useEffect(() => {
    const interval = setInterval(() => setRemainingLabel(formatDaysRemaining(expiresAt)), 60_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goToPage(pageIndex + 1);
      if (event.key === "ArrowLeft") goToPage(pageIndex - 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pageIndex, goToPage]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    function blockPrint(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && (key === "p" || key === "s")) {
        event.preventDefault();
      }
    }
    window.addEventListener("keydown", blockPrint);
    return () => window.removeEventListener("keydown", blockPrint);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  const pageSrc = useMemo(() => `/api/rentals/${productId}/pages/${pageIndex}`, [productId, pageIndex]);

  return (
    <main className="flex h-screen flex-col bg-ink-700">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-cream-50 px-4 py-2.5 shadow-soft">
        <Link href="/account/rentals" className="tap-target inline-flex shrink-0 items-center gap-2 text-sm font-bold text-ink-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xs:inline">My rentals</span>
        </Link>

        <div className="order-3 min-w-0 basis-full text-center sm:order-none sm:basis-auto sm:flex-1">
          <h1 className="line-clamp-1 font-display text-base font-bold text-ink-700 sm:text-lg">{title}</h1>
          <p
            className="mt-0.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-400"
            role="status"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {remainingLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomStep((s) => Math.max(s - 1, 0))}
            disabled={zoomStep === 0}
            aria-label="Zoom out"
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 disabled:opacity-30"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setZoomStep((s) => Math.min(s + 1, ZOOM_STEPS.length - 1))}
            disabled={zoomStep === ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 disabled:opacity-30"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" aria-hidden="true" /> : <Maximize className="h-4 w-4" aria-hidden="true" />}
          </button>
          <span className="mx-1 h-6 w-px bg-ink-100" aria-hidden="true" />
          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            aria-label="Previous page"
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="whitespace-nowrap text-xs font-bold text-ink-500 sm:text-sm" aria-live="polite">
            {pageIndex + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex === pageCount - 1}
            aria-label="Next page"
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {upgrade && showUpgradeBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-sage-50 px-4 py-2.5 text-sm">
          <p className="text-ink-700">
            <span className="font-semibold">Want to keep this book?</span>{" "}
            <span className="text-ink-500">
              Buy the ebook and keep permanent download access. The {formatPrice(upgrade.rentalPricePaid, RENTAL_CURRENCY_CODE)}{" "}
              you already paid is credited toward the purchase.
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={upgradeNow}
              className="tap-target rounded-full bg-sage-600 px-4 py-2 text-xs font-bold text-cream-50 hover:bg-sage-700"
            >
              Buy for {formatPrice(upgrade.price, RENTAL_CURRENCY_CODE)}
            </button>
            <button
              type="button"
              onClick={() => setShowUpgradeBanner(false)}
              aria-label="Dismiss"
              className="tap-target flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-sage-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div
        className="relative flex-1 select-none overflow-auto bg-ink-700"
        onContextMenu={(event) => event.preventDefault()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Side arrow buttons — desktop/tablet only (a touch device already
            has swipe, and these would just sit awkwardly on a narrow phone
            screen next to a full-width page). Hidden once zoomed in, since
            the page itself becomes horizontally scrollable at that point
            and a fixed side button would float over the content instead of
            beside it. */}
        {zoom === 1 && (
          <>
            <button
              type="button"
              onClick={() => goToPage(pageIndex - 1)}
              disabled={pageIndex === 0}
              aria-label="Previous page"
              className="tap-target absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/90 text-ink-600 shadow-clay hover:bg-cream-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToPage(pageIndex + 1)}
              disabled={pageIndex === pageCount - 1}
              aria-label="Next page"
              className="tap-target absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/90 text-ink-600 shadow-clay hover:bg-cream-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        <div className="flex min-h-full w-fit min-w-full items-center justify-center p-4">
          <div
            className="relative overflow-hidden rounded-lg bg-cream-50 shadow-clay"
            style={{
              width: zoom === 1 ? "auto" : `min(48rem, ${zoom * 100}vw - 2rem)`,
              height: zoom === 1 ? "100%" : "auto",
              maxWidth: zoom === 1 ? "min(48rem, 100%)" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- intentionally bypassing next/image's optimizer/proxy for protected rental content */}
            <img
              key={pageSrc}
              src={pageSrc}
              alt={`${title} — page ${pageIndex + 1}`}
              className="pointer-events-none block h-full w-full select-none object-contain"
              draggable={false}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.07]"
            >
              <span className="-rotate-[30deg] whitespace-nowrap text-2xl font-bold text-ink-900 sm:text-4xl">
                {watermarkLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
