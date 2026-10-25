import { NextResponse } from "next/server";

/**
 * Error responses for routes that serve files from storage.
 *
 * Every error is marked no-store so neither Vercel nor Cloudflare keeps
 * it — a cached error would keep an image broken long after storage
 * recovered. (Cloudflare's "Cache product assets" rule ignores origin
 * headers, so it also needs a status-code TTL of "No cache" for 4xx/5xx.)
 */
const NO_STORE = { "Cache-Control": "no-store" };

/** Content type for a preview or Rent & Read page. Pages compressed in
 * the browser are WebP; older ones are JPEG (some still named .png), which
 * browsers display fine under image/jpeg. */
export function pageImageContentType(pathname: string) {
  return pathname.endsWith(".webp") ? "image/webp" : "image/jpeg";
}

/** The file genuinely isn't there (or isn't public). */
export function assetNotFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404, headers: NO_STORE });
}

function isMissingObjectError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { name, code, $metadata } = error as {
    name?: string;
    code?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return name === "NoSuchKey" || name === "NotFound" || code === "ENOENT" || $metadata?.httpStatusCode === 404;
}

/**
 * A storage read failed. A missing file is a 404; anything else (e.g.
 * Backblaze's daily download cap being reached, or an outage) is a 503
 * with the real error logged to Vercel, so it shows up as what it is
 * instead of a misleading "not found".
 */
export function storageReadFailure(error: unknown, what: string) {
  if (isMissingObjectError(error)) return assetNotFound(`${what} not found`);

  console.error(`Storage read failed for ${what}:`, error);
  return NextResponse.json(
    { error: `${what} is temporarily unavailable. Please try again shortly.` },
    { status: 503, headers: { ...NO_STORE, "Retry-After": "300" } }
  );
}
