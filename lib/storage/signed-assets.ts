import { createHmac } from "node:crypto";

/**
 * Short-lived signed links to private files (paid PDFs, Rent & Read pages)
 * on the Cloudflare assets Worker (cloudflare/assets-worker.js).
 *
 * The site still does every access check (login, purchase, active rental)
 * and only then hands out one of these links. The Worker refuses any link
 * whose signature or expiry doesn't check out, and keeps a copy of each
 * file at Cloudflare so repeat downloads don't use Backblaze's daily
 * download allowance.
 *
 * Off unless both ASSETS_CDN_DOMAIN and ASSETS_SIGNING_SECRET are set (the
 * Worker needs the same secret) — callers then fall back to a direct
 * Backblaze link.
 */

/** Must match the Worker's message format exactly. */
export function assetSignaturePayload(key: string, expiresAt: number, download: string) {
  return `${key}\n${expiresAt}\n${download}`;
}

export function signAssetPayload(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function isSignedAssetsConfigured() {
  return Boolean(process.env.ASSETS_CDN_DOMAIN && process.env.ASSETS_SIGNING_SECRET);
}

export function signedAssetUrl(
  key: string,
  { expiresAt, download = "" }: { expiresAt: number; download?: string }
): string | null {
  const domain = process.env.ASSETS_CDN_DOMAIN;
  const secret = process.env.ASSETS_SIGNING_SECRET;
  if (!domain || !secret) return null;

  const sig = signAssetPayload(secret, assetSignaturePayload(key, expiresAt, download));
  const params = new URLSearchParams({ exp: String(expiresAt) });
  if (download) params.set("dl", download);
  params.set("sig", sig);

  const path = key.split("/").map(encodeURIComponent).join("/");
  return `https://${domain}/${path}?${params}`;
}
