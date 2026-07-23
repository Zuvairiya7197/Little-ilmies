"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, BookOpen } from "lucide-react";
import { booksMenuSections } from "@/lib/store-navigation";

export function BooksMegaMenu() {
  const [open, setOpen] = useState(false);
  const [panelLeft, setPanelLeft] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const updatePanelPosition = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const panelWidth = Math.min(820, window.innerWidth - 32);
    const desiredLeft = wrapperRect.left + wrapperRect.width / 2 - panelWidth / 2;
    const clampedLeft = Math.max(16, Math.min(desiredLeft, window.innerWidth - panelWidth - 16));
    setPanelLeft(clampedLeft - wrapperRect.left);
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("resize", updatePanelPosition);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [updatePanelPosition]);

  useEffect(() => {
    if (open) updatePanelPosition();
  }, [open, updatePanelPosition]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="books-mega-menu"
        onClick={() => setOpen((value) => !value)}
        onFocus={updatePanelPosition}
        className="tap-target flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-ink-600 transition-all duration-200 hover:bg-cream-50 hover:shadow-clay-sm"
      >
        Books
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <div
        id="books-mega-menu"
        style={{ left: panelLeft }}
        className={`absolute left-0 top-full z-50 mt-2 w-[min(820px,calc(100vw-2rem))] transition-all duration-200 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="max-h-[min(620px,calc(100vh-9rem))] overflow-y-auto rounded-3xl border border-ink-100 bg-cream-50 p-4 shadow-lifted">
          <div className="mb-3 flex items-center justify-between gap-4 border-b border-ink-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50 text-sage-700">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink-700">Browse Books</p>
                <p className="text-xs text-ink-400">Find resources by topic, activity, or age.</p>
              </div>
            </div>
            <Link href="/shop" onClick={() => setOpen(false)} className="hidden text-sm font-semibold text-sage-700 underline-offset-4 hover:underline xl:block">
              View all books
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {booksMenuSections.map((section) => (
              <div key={section.title}>
                <Link
                  href={section.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-sm font-bold leading-tight text-ink-700 transition-colors hover:text-sage-700"
                >
                  {section.title}
                </Link>
                <ul className="mt-2 flex flex-col gap-1">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-2 py-1 text-xs font-medium leading-tight text-ink-400 transition-colors hover:bg-cream-100 hover:text-ink-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
