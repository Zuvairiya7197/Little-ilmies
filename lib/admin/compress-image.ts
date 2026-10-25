import { COVER_THUMB_WIDTH } from "@/lib/cover-thumb";

/**
 * Shrinks admin-uploaded images in the browser before they go straight to
 * B2, so neither Vercel nor Backblaze ever handles the oversized original.
 * Preview and Rent & Read pages are the site's most-viewed files; in a
 * test on 22 live pages, WebP at quality 85 made them 43–73% smaller with
 * no visible change.
 *
 * Never blocks an upload: if the browser can't encode the image, or the
 * result saves too little, the original file is used.
 */

const PAGE_MAX_DIMENSION = 2400;
const PAGE_QUALITY = 0.85;
// Same settings the server used for covers (lib/storage saveCoverImage).
const COVER_MAX_DIMENSION = 1200;
const COVER_QUALITY = 0.82;
const COVER_THUMB_QUALITY = 0.72;

/** Keep the re-encoded image only if it's at least this much smaller. */
const MIN_SAVING = 0.1;

export interface ImageCompressionResult {
  file: File;
  originalSize: number;
  compressed: boolean;
}

/** A preview or Rent & Read page: WebP, or JPEG where the browser can't
 * encode WebP (older Safari), at most 2400px on the longest side. */
export async function compressPageImage(file: File): Promise<ImageCompressionResult> {
  const original = { file, originalSize: file.size, compressed: false };
  if (!isRasterImage(file)) return original;

  try {
    const bitmap = await createImageBitmap(file);
    const resized = Math.max(bitmap.width, bitmap.height) > PAGE_MAX_DIMENSION;
    const blob =
      (await encode(bitmap, PAGE_MAX_DIMENSION, "image/webp", PAGE_QUALITY)) ??
      (await encode(bitmap, PAGE_MAX_DIMENSION, "image/jpeg", PAGE_QUALITY));
    bitmap.close();
    if (!blob) return original;

    // An oversized page is always resized (it'd be wasted on any screen);
    // otherwise re-encoding has to be worth it.
    const worthIt = resized ? blob.size < file.size : blob.size <= file.size * (1 - MIN_SAVING);
    if (!worthIt) return original;

    return { file: renamed(file, blob), originalSize: file.size, compressed: true };
  } catch {
    return original;
  }
}

export interface PreparedCover {
  cover: File;
  /** The small copy for cards (see lib/cover-thumb.ts). */
  thumb: File;
  originalSize: number;
}

/** A book or category cover as WebP plus its small copy, or null when the
 * browser can't produce WebP — the caller then lets the server do it. */
export async function prepareCoverImages(file: File): Promise<PreparedCover | null> {
  if (!isRasterImage(file)) return null;

  try {
    const bitmap = await createImageBitmap(file);
    const [cover, thumb] = await Promise.all([
      encode(bitmap, COVER_MAX_DIMENSION, "image/webp", COVER_QUALITY),
      encode(bitmap, COVER_THUMB_WIDTH, "image/webp", COVER_THUMB_QUALITY, "width"),
    ]);
    bitmap.close();
    if (!cover || !thumb) return null;

    return { cover: renamed(file, cover), thumb: renamed(file, thumb), originalSize: file.size };
  } catch {
    return null;
  }
}

function isRasterImage(file: File) {
  return /^image\/(jpe?g|png|webp)$/.test(file.type);
}

/**
 * Draws the image no larger than `max` (on its longest side, or its width)
 * and encodes it. Returns null if the browser silently fell back to another
 * format — canvas does that for types it can't encode.
 */
async function encode(
  bitmap: ImageBitmap,
  max: number,
  type: "image/webp" | "image/jpeg",
  quality: number,
  limit: "longest" | "width" = "longest"
): Promise<Blob | null> {
  const scale = Math.min(1, max / (limit === "width" ? bitmap.width : Math.max(bitmap.width, bitmap.height)));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  if (type === "image/jpeg") {
    // JPEG has no transparency; without this, transparent areas turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  return blob && blob.type === type ? blob : null;
}

function renamed(file: File, blob: Blob) {
  const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ext, { type: blob.type });
}
