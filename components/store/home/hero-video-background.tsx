"use client";

import { useEffect, useRef } from "react";

const FADE_DURATION = 0.5;
const HERO_VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

/**
 * Seamless fade-looping background video: fades in over the first 0.5s,
 * fades out over the last 0.5s, then restarts from currentTime 0 rather
 * than relying on the browser's native loop (which cuts hard at the seam).
 */
export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el: HTMLVideoElement | null = videoRef.current;
    if (!el) return;

    let raf: number;

    const tick = () => {
      if (el.duration > 0) {
        if (el.currentTime < FADE_DURATION) {
          el.style.opacity = String(el.currentTime / FADE_DURATION);
        } else if (el.currentTime > el.duration - FADE_DURATION) {
          el.style.opacity = String((el.duration - el.currentTime) / FADE_DURATION);
        } else {
          el.style.opacity = "1";
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      el.style.opacity = "0";
      setTimeout(() => {
        el.currentTime = 0;
        el.play().catch(() => {});
      }, 100);
    };

    el.addEventListener("ended", onEnded);
    raf = requestAnimationFrame(tick);
    el.play().catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        src={HERO_VIDEO_SRC}
        muted
        playsInline
        autoPlay
        preload="auto"
        className="h-full w-full object-cover opacity-0"
      />
      {/* Soft edge fades into the page's cream background only — no wash over the video itself */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream-50 to-transparent xs:h-28" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream-50 to-transparent xs:h-36" />
    </div>
  );
}
