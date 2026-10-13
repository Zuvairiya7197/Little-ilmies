/**
 * Every uploaded WebP cover (covers/<name>.webp) also gets a small copy at
 * covers/<name>.thumb.webp, for cards, carts and lists, so those don't
 * download the full product-page cover. Shared by the upload code, the
 * storage report and the image wrapper (client side), so keep it free of
 * server-only imports.
 */
export const COVER_THUMB_WIDTH = 400;

/** Storage key (or URL) of a cover's small copy, or null if it has none. */
export function coverThumbPath(coverPath: string): string | null {
  if (!/\/?covers\/[^?#]+\.webp$/.test(coverPath) || coverPath.endsWith(".thumb.webp")) return null;
  return coverPath.replace(/\.webp$/, ".thumb.webp");
}
