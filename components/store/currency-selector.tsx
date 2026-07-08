"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { CURRENCIES, type CurrencyCode } from "@/types/pricing";
import { cn } from "@/lib/utils/cn";

const options = Object.values(CURRENCIES);

export function CurrencySelector({
  variant = "header",
}: {
  variant?: "header" | "checkout";
}) {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSelect(code: CurrencyCode) {
    setCurrency(code, true);
    setOpen(false);
  }

  const current = CURRENCIES[currency];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${current.label}. Change currency`}
        className={cn(
          "tap-target flex items-center gap-1 rounded-full border border-ink-100 bg-cream-50 px-2.5 text-xs font-semibold text-ink-600 transition-colors hover:border-ink-300 xs:gap-1.5 xs:px-3 xs:text-sm",
          variant === "checkout" && "px-4 text-sm"
        )}
      >
        <Globe className="hidden h-4 w-4 text-ink-300 xs:block" aria-hidden="true" />
        <span aria-hidden="true">{current.symbol}</span> {current.code}
        <ChevronDown className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select currency"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-cream-50 py-1.5 shadow-lifted"
        >
          {options.map((opt) => (
            <li key={opt.code}>
              <button
                type="button"
                role="option"
                aria-selected={opt.code === currency}
                onClick={() => handleSelect(opt.code)}
                className="tap-target flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-ink-600 transition-colors hover:bg-ink-50"
              >
                <span>
                  <span className="font-semibold">
                    {opt.symbol} {opt.code}
                  </span>
                  <span className="ml-1.5 text-ink-300">{opt.label}</span>
                </span>
                {opt.code === currency && (
                  <Check className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
