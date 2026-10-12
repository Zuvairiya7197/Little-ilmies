import type { BookFormat, ProductVariant } from "@/types/catalog";

/**
 * Display copy for each purchasable format. Prices and availability are
 * never defined here — they come from each product's own configuration
 * (see toProductSummary in lib/db/catalog.ts).
 */
export const FORMAT_DETAILS: Record<
  BookFormat,
  { name: string; shortName: string; tagline: string; benefits: (variant: ProductVariant) => string[] }
> = {
  COLOUR_PDF: {
    name: "Colour Printable PDF",
    shortName: "Colour PDF",
    tagline: "High-quality colour pages to print at home",
    benefits: () => [
      "Instant digital download after purchase",
      "Print at home in full colour",
      "Print again whenever you need, for personal use under the book's licence",
    ],
  },
  BW_PDF: {
    name: "Black & White Printable PDF",
    shortName: "B&W PDF",
    tagline: "Ink-friendly version for economical printing",
    benefits: () => [
      "Instant digital download after purchase",
      "Ink-friendly pages for economical home printing",
      "Print again whenever you need, for personal use under the book's licence",
    ],
  },
  RENT_AND_READ: {
    name: "Rent & Read",
    shortName: "Rent & Read",
    tagline: "Read online, no PDF download",
    benefits: (variant) => [
      `Read online for ${variant.rentalDurationDays ?? 7} days`,
      "No PDF download or printing",
      "Available in India only",
    ],
  },
};

export const PDF_FORMATS = ["COLOUR_PDF", "BW_PDF"] as const satisfies readonly BookFormat[];
export type PdfFormat = (typeof PDF_FORMATS)[number];

export function isPdfFormat(format: string | null | undefined): format is PdfFormat {
  return format === "COLOUR_PDF" || format === "BW_PDF";
}

/** Stable variant ID used in the cart: one product, one format. */
export function variantId(productId: string, format: BookFormat) {
  return `${productId}:${format}`;
}

/** Download URL for one owned PDF format. Colour keeps the original URL
 * so existing links in emails and bookmarks keep working. */
export function downloadHref(productId: string, format: PdfFormat = "COLOUR_PDF") {
  return format === "COLOUR_PDF" ? `/api/download/${productId}` : `/api/download/${productId}?format=bw`;
}

export function formatName(format: BookFormat | null | undefined) {
  return FORMAT_DETAILS[format ?? "COLOUR_PDF"].name;
}

/** `?format=` values on product page URLs, so a chosen format survives
 * navigation (back button, links from the cart). */
export const FORMAT_URL_PARAM: Record<BookFormat, string> = {
  COLOUR_PDF: "colour",
  BW_PDF: "bw",
  RENT_AND_READ: "rent",
};

export function formatFromUrlParam(value: string | null | undefined): BookFormat | null {
  const match = (Object.keys(FORMAT_URL_PARAM) as BookFormat[]).find((format) => FORMAT_URL_PARAM[format] === value);
  return match ?? null;
}

export function productHref(slug: string, format?: BookFormat) {
  return format ? `/product/${slug}?format=${FORMAT_URL_PARAM[format]}` : `/product/${slug}`;
}
