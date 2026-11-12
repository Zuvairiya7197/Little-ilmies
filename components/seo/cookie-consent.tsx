"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { REOPEN_CONSENT_EVENT, readAdConsent, saveAdConsent } from "@/lib/consent";

/** Asks once before the Meta Pixel may run. Essential cookies (sign-in,
 * currency) don't need consent and aren't affected by the answer. */
export function CookieConsentBanner() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Read after mount: the choice lives in this browser, not on the server.
  useEffect(() => {
    setIsOpen(readAdConsent() === "unset");
    const reopen = () => setIsOpen(true);
    window.addEventListener(REOPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!isOpen || pathname?.startsWith("/admin")) return null;
  // Checkout and cart keep their pay/continue bar at the bottom, so the
  // banner moves to the top there instead of covering it.
  const atTop = pathname?.startsWith("/checkout") || pathname?.startsWith("/cart");

  function choose(consent: "accepted" | "declined") {
    saveAdConsent(consent);
    setIsOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      style={atTop ? { top: "0.75rem" } : { bottom: "calc(var(--mobile-nav-height) + 0.75rem)" }}
      className={cn(
        "fixed inset-x-3 z-50 mx-auto max-w-xl rounded-3xl border border-ink-100 bg-cream-50 p-4 shadow-lifted",
        !atTop && "xl:!bottom-5"
      )}
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-ink-600">
          We use essential cookies to run the shop. With your permission we&apos;d also use the Meta Pixel to measure
          our Facebook and Instagram adverts.{" "}
          <Link href="/privacy-policy" className="font-semibold text-sage-700 underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={() => choose("declined")} className="btn-secondary px-5 py-2">
          Decline
        </button>
        <button type="button" onClick={() => choose("accepted")} className="btn-primary px-5 py-2">
          Accept
        </button>
      </div>
    </div>
  );
}

/** Footer link that shows the banner again so the choice can be changed. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(REOPEN_CONSENT_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}
