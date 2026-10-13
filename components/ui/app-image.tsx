"use client";

import { useState } from "react";
import NextImage, { type ImageProps } from "next/image";
import { coverThumbPath } from "@/lib/cover-thumb";

// Uploaded covers/previews: from the Cloudflare assets Worker
// (https://<ASSETS_CDN_DOMAIN>/covers/...) or, without it, the proxy routes.
const UPLOADED_ASSET = /^(https?:\/\/[^/]+\/(covers|previews)\/|\/api\/(product|category)-assets\/)/;

// Covers shown no wider than this (CSS px) use the small copy, which is
// COVER_THUMB_WIDTH px wide — sharp up to ~2x screens.
const THUMB_MAX_DISPLAY_PX = 260;
// Assumed widest layout for a vw-only `sizes` entry.
const MAX_VIEWPORT_PX = 1440;

/** Largest width (CSS px) a `sizes`/`width` combination can display at. */
function maxDisplayPx(sizes: string | undefined, width: ImageProps["width"]) {
  if (!sizes) return typeof width === "number" ? width : Infinity;
  let max = 0;
  for (const entry of sizes.split(",")) {
    const maxWidth = entry.match(/\(max-width:\s*(\d+)px\)/);
    const value = entry.trim().match(/(\d+(?:\.\d+)?)(px|vw)\s*$/);
    if (!value) return Infinity;
    const n = Number(value[1]);
    const px = value[2] === "px" ? n : (n / 100) * (maxWidth ? Number(maxWidth[1]) : MAX_VIEWPORT_PX);
    max = Math.max(max, px);
  }
  return max;
}

/**
 * next/image with Vercel's optimizer skipped where it only spends billed
 * Image Optimization transformations (Hobby: 5,000/month):
 *  - public/images/*: pre-converted to right-sized WebP in the repo.
 *  - uploaded covers/previews: already WebP and cached by Cloudflare. Small
 *    displays (cards, carts, lists) get the cover's .thumb.webp copy, and
 *    fall back to the full cover if that copy is missing.
 */
export default function Image(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : null;
  const isStatic = src?.startsWith("/images/") ?? false;
  const isUploaded = src ? UPLOADED_ASSET.test(src) : false;

  const thumb =
    src && isUploaded && maxDisplayPx(props.sizes, props.width) <= THUMB_MAX_DISPLAY_PX ? coverThumbPath(src) : null;
  const [failedThumb, setFailedThumb] = useState<string | null>(null);
  const useThumb = thumb !== null && failedThumb !== thumb;

  return (
    <NextImage
      {...props}
      src={useThumb ? thumb : props.src}
      unoptimized={props.unoptimized ?? (isStatic || isUploaded)}
      onError={(event) => {
        if (useThumb) setFailedThumb(thumb);
        props.onError?.(event);
      }}
    />
  );
}
