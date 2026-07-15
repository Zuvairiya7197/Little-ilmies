"use client";

import { useEffect, useRef } from "react";

const HERO_VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

/**
 * Continuously looping background video — plays at full opacity at all
 * times, including across the loop seam, via the native `loop` attribute.
 * No opacity fade: fading the video out (even briefly) reveals the
 * container background behind it, which reads as a white flash.
 */
export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el: HTMLVideoElement | null = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-cream-50" aria-hidden="true">
      <video
        ref={videoRef}
        src={HERO_VIDEO_SRC}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        className="h-full w-full object-cover"
      />
      {/* Soft edge fade into the page's cream background at the top only — no wash over the video itself */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream-50 to-transparent xs:h-28" />
    </div>
  );
}
