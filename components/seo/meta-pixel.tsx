"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { subscribeAdConsent, type AdConsent } from "@/lib/consent";

const PIXEL_ID = "1439152594991313";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Meta (Facebook) Pixel. The standard snippet only tracks the first page
 * load, but in-app navigations here are client-side, so later pathname
 * changes send their own PageView. The first one comes from the inline
 * script, since this effect runs before the script has defined fbq.
 * Admin pages are skipped so staff browsing doesn't pollute ad audiences.
 * Nothing loads until the visitor accepts advertising cookies in the
 * consent banner (there's no no-JS fallback, as that couldn't ask first).
 */
export function MetaPixel() {
  const [consent, setConsent] = useState<AdConsent>("unset");
  useEffect(() => subscribeAdConsent(setConsent), []);
  if (consent !== "accepted") return null;
  return <MetaPixelScript />;
}

function MetaPixelScript() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (pathname?.startsWith("/admin")) return;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');if(!location.pathname.startsWith('/admin'))fbq('track','PageView');`}
    </Script>
  );
}
