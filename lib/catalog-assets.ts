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
