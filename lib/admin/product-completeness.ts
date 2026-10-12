import type { Category, Product, ProductCategory, ProductPrice } from "@prisma/client";
import { isFormatAvailable, pricesForFormat, primaryPdfFormat, rentalPriceFor } from "@/lib/product-formats";
import { FORMAT_DETAILS, type PdfFormat } from "@/lib/formats";
import type { BookFormat } from "@/types/catalog";

export type CompletenessProduct = Product & {
  prices: ProductPrice[];
  categories: (ProductCategory & { category: Category })[];
};

export interface ProductCompleteness {
  /** Things to add before the book is fully set up, e.g. "Colour PDF file". */
  missing: string[];
  /** Short names of the formats currently on sale. */
  liveFormats: string[];
  /** Prices of the primary PDF format, for the list's price column. */
  displayPrices: { currencyCode: string; regularPrice: number }[];
}

const PLACEHOLDER_COVER_PREFIX = "/images/products/placeholder";

/**
 * What an admin still has to add for a book. Uses the same availability
 * rules as the storefront (lib/product-formats.ts), so "nothing missing"
 * means every switched-on format is actually for sale.
 */
export function getProductCompleteness(
  product: CompletenessProduct,
  bookSaleDiscountPercentage: number
): ProductCompleteness {
  const missing: string[] = [];

  if (!product.coverImage || product.coverImage.startsWith(PLACEHOLDER_COVER_PREFIX)) missing.push("Cover image");
  if (product.categories.length === 0) missing.push("Category");
  if (product.hasFreePreview && product.previewImagePaths.length === 0) missing.push("Preview images");

  const pdfFormats: { format: PdfFormat; enabled: boolean; file: string | null }[] = [
    { format: "COLOUR_PDF", enabled: product.colourPdfEnabled, file: product.privatePdfPath },
    { format: "BW_PDF", enabled: product.bwPdfEnabled, file: product.bwPrivatePdfPath },
  ];
  for (const { format, enabled, file } of pdfFormats) {
    if (!enabled) continue;
    const label = format === "BW_PDF" ? "B&W" : "Colour";
    const prices = pricesForFormat(product, format);
    if (!file) missing.push(`${label} PDF file`);
    if (prices.length === 0) missing.push(`${label} PDF price`);
    else if (!prices.some((p) => p.currencyCode === "USD")) missing.push(`${label} USD price`);
  }

  if (product.rentAndReadEnabled) {
    if (product.rentalPageImagePaths.length === 0) missing.push("Rent & Read pages");
    if (rentalPriceFor(product, bookSaleDiscountPercentage) == null) missing.push("Rent & Read price");
  }

  if (!product.colourPdfEnabled && !product.bwPdfEnabled && !product.rentAndReadEnabled) {
    missing.push("A format to sell");
  }

  const liveFormats = (["COLOUR_PDF", "BW_PDF", "RENT_AND_READ"] as BookFormat[])
    .filter((format) => isFormatAvailable(product, format, bookSaleDiscountPercentage))
    .map((format) => FORMAT_DETAILS[format].shortName);

  const displayPrices = pricesForFormat(product, primaryPdfFormat(product) ?? "COLOUR_PDF").map((p) => ({
    currencyCode: p.currencyCode,
    regularPrice: p.regularPrice,
  }));

  return { missing, liveFormats, displayPrices };
}
