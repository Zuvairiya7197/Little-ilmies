export function productCoverUrl(productId: string, coverImage: string) {
  if (coverImage.startsWith("covers/")) {
    return `/api/product-assets/covers/${productId}?v=${encodeURIComponent(coverImage)}`;
  }
  return coverImage;
}

export function productPreviewUrls(productId: string, previewImagePaths: string[]) {
  return previewImagePaths.map((path, index) =>
    path.startsWith("previews/")
      ? `/api/product-assets/previews/${productId}/${index}?v=${encodeURIComponent(path)}`
      : path
  );
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
