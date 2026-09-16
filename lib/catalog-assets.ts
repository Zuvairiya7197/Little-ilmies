/**
 * Cover images and free-preview pages are intentionally public-safe (the
 * product page already shows them to anyone), so when a CDN domain is
 * configured they're served directly from there instead of proxied
 * through a Next.js route — cheaper (no egress through the app server)
 * and cacheable at the edge. Full PDFs and Rent & Read pages never use
 * this path; see productRentalPageUrls below, which always stays on the
 * authenticated admin/rental routes regardless of this env var.
 */
const CDN_DOMAIN = process.env.ASSETS_CDN_DOMAIN;

export function productCoverUrl(productId: string, coverImage: string) {
  if (coverImage.startsWith("covers/")) {
    if (CDN_DOMAIN) return `https://${CDN_DOMAIN}/${coverImage}`;
    return `/api/product-assets/covers/${productId}?v=${encodeURIComponent(coverImage)}`;
  }
  return coverImage;
}

export function productPreviewUrls(productId: string, previewImagePaths: string[]) {
  return previewImagePaths.map((path, index) => {
    if (!path.startsWith("previews/")) return path;
    if (CDN_DOMAIN) return `https://${CDN_DOMAIN}/${path}`;
    return `/api/product-assets/previews/${productId}/${index}?v=${encodeURIComponent(path)}`;
  });
}

/**
 * Admin-only preview URLs for uploaded rental page images. Unlike
 * productPreviewUrls, these resolve to the entitlement-gated
 * /api/admin/product-assets route (admin session required), never the
 * public previews route — rental pages are the full book and must never
 * be reachable without authorization.
 */
export function productRentalPageUrls(productId: string, rentalPageImagePaths: string[]) {
  return rentalPageImagePaths.map((path, index) =>
    path.startsWith("rentals/")
      ? `/api/admin/product-assets/rentals/${productId}/${index}?v=${encodeURIComponent(path)}`
      : path
  );
}
