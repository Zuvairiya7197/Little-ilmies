"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";

interface RentalReaderProps {
  productId: string;
  title: string;
  pageCount: number;
  expiresAt: string; // ISO
  watermarkLabel: string;
}

const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2];

function formatDaysRemaining(expiresAt: string) {
  const msRemaining = new Date(expiresAt).getTime() - Date.now();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  if (daysRemaining <= 0) return "Expires soon";
  if (daysRemaining === 1) return "Expires tomorrow";
  return `${daysRemaining} days remaining`;
}

export function RentalReader({ productId, title, pageCount, expiresAt, watermarkLabel }: RentalReaderProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remainingLabel, setRemainingLabel] = useState(() => formatDaysRemaining(expiresAt));

  const zoom = ZOOM_STEPS[zoomStep];

  const goToPage = useCallback(
    (next: number) => {
      setPageIndex(Math.min(Math.max(next, 0), pageCount - 1));
    },
    [pageCount]
  );

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

  const watermarkTiles = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <main className="flex h-screen flex-col bg-ink-700">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-50 px-4 py-3 shadow-soft">
        <Link href="/account/rentals" className="tap-target inline-flex items-center gap-2 text-sm font-bold text-ink-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          My rentals
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="line-clamp-1 font-display text-lg font-bold text-ink-700">{title}</h1>
          <p
            className="mt-0.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-400"
            role="status"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {remainingLabel}
          </p>
        </div>
        <span className="hidden w-24 lg:block" aria-hidden="true" />
      </div>

      <div
        className="relative flex-1 select-none overflow-auto bg-ink-700"
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative overflow-hidden rounded-lg bg-cream-50 shadow-clay"
            style={{ width: `${zoom * 100}%`, maxWidth: zoom === 1 ? "48rem" : "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- intentionally bypassing next/image's optimizer/proxy for protected rental content */}
            <img
              key={pageSrc}
              src={pageSrc}
              alt={`${title} — page ${pageIndex + 1}`}
              className="pointer-events-none block w-full select-none"
              draggable={false}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-wrap content-around justify-around overflow-hidden opacity-[0.12]"
            >
              {watermarkTiles.map((i) => (
                <span
                  key={i}
                  className="-rotate-[30deg] whitespace-nowrap text-xs font-semibold text-ink-900 sm:text-sm"
                >
                  {watermarkLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream-50 px-4 py-3 shadow-soft">
        <div className="flex items-center gap-1.5">
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
            className="tap-target hidden h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 sm:flex"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" aria-hidden="true" /> : <Maximize className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="tap-target flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <span className="text-sm font-bold text-ink-500" aria-live="polite">
            {pageIndex + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex === pageCount - 1}
            className="tap-target flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <span className="hidden w-24 sm:block" aria-hidden="true" />
      </div>
    </main>
  );
}
