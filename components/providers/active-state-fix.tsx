"use client";

import { useEffect } from "react";

/**
 * iOS Safari (and some other WebKit-based mobile browsers) only apply
 * :active CSS styles to an element if some touch event listener exists
 * somewhere in the document — otherwise it treats a tap as a plain click
 * and skips the pressed state entirely, however deliberately every
 * button/link's :active rule (see tap-target in globals.css) is written.
 * This is a long-documented WebKit quirk, not a bug in our CSS. A no-op
 * document-level touchstart listener is the standard, harmless fix.
 */
export function ActiveStateFix() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return null;
}
