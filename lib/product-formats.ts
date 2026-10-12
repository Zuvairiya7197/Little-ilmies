import type { Product, ProductPrice } from "@prisma/client";
import type { BookFormat, ProductVariant } from "@/types/catalog";
import type { CurrencyCode, RegionalPrice } from "@/types/pricing";
import { calculateBookSalePrice } from "@/lib/pricing/automatic-pricing";
import { calculateRentalPrice } from "@/lib/rentals/pricing";
import { RENTAL_CURRENCY_CODE } from "@/lib/rentals/config";
import { variantId, type PdfFormat } from "@/lib/formats";

/**
 * Single source of truth for which formats of a book can be bought and at
 * what price. The storefront (lib/db/catalog.ts) and checkout
 * (create-order) both go through here, so a format the page doesn't offer
 * can never be bought by editing the cart.
 */
export type FormatSource = Pick<
  Product,
  | "id"
  | "colourPdfEnabled"
  | "privatePdfPath"
  | "bwPdfEnabled"
  | "bwPrivatePdfPath"
  | "rentAndReadEnabled"
  | "rentalPageImagePaths"
  | "rentalPrice"
  | "rentalDurationDays"
> & { prices: ProductPrice[] };

export const FORMAT_SOURCE_SELECT = {
  id: true,
  colourPdfEnabled: true,
  privatePdfPath: true,
  bwPdfEnabled: true,
  bwPrivatePdfPath: true,
  rentAndReadEnabled: true,
  rentalPageImagePaths: true,
  rentalPrice: true,
  rentalDurationDays: true,
  prices: true,
} as const;

export function pricesForFormat(product: Pick<FormatSource, "prices">, format: PdfFormat) {
  return product.prices.filter((price) => price.format === format && price.isActive);
}

/** Private storage path of the PDF a format delivers. */
export function pdfPathForFormat(
  product: Pick<FormatSource, "privatePdfPath" | "bwPrivatePdfPath">,
  format: PdfFormat
) {
  return format === "BW_PDF" ? product.bwPrivatePdfPath : product.privatePdfPath;
}

function isPdfFormatAvailable(product: FormatSource, format: PdfFormat) {
  const enabled = format === "BW_PDF" ? product.bwPdfEnabled : product.colourPdfEnabled;
  return enabled && Boolean(pdfPathForFormat(product, format)) && pricesForFormat(product, format).length > 0;
}

/**
 * Rent & Read price in INR minor units, or null when it can't be priced.
 * An explicit per-book rental price wins; otherwise the original automatic
 * rule (a share of the colour PDF's current INR sale price) applies so
 * existing rentals keep their price.
 */
export function rentalPriceFor(product: FormatSource, bookSaleDiscountPercentage: number): number | null {
  if (product.rentalPrice != null) return product.rentalPrice;

  const inr =
    pricesForFormat(product, "COLOUR_PDF").find((p) => p.currencyCode === RENTAL_CURRENCY_CODE) ??
    pricesForFormat(product, "BW_PDF").find((p) => p.currencyCode === RENTAL_CURRENCY_CODE);
  if (!inr) return null;

  const now = Date.now();
  const saleActive =
    !(inr.saleStartDate && now < inr.saleStartDate.getTime()) && !(inr.saleEndDate && now > inr.saleEndDate.getTime());
  const salePrice = saleActive
    ? calculateBookSalePrice(inr.regularPrice, bookSaleDiscountPercentage, RENTAL_CURRENCY_CODE)
    : inr.regularPrice;
  return calculateRentalPrice(salePrice);
}

export function isFormatAvailable(product: FormatSource, format: BookFormat, bookSaleDiscountPercentage: number) {
  if (format === "RENT_AND_READ") {
    return (
      product.rentAndReadEnabled &&
      product.rentalPageImagePaths.length > 0 &&
      rentalPriceFor(product, bookSaleDiscountPercentage) != null
    );
  }
  return isPdfFormatAvailable(product, format);
}

/** The PDF a custom bundle or a "from" price uses: colour when it can be
 * sold, otherwise black & white. Null when neither PDF is purchasable. */
export function primaryPdfFormat(product: FormatSource): PdfFormat | null {
  if (isPdfFormatAvailable(product, "COLOUR_PDF")) return "COLOUR_PDF";
  if (isPdfFormatAvailable(product, "BW_PDF")) return "BW_PDF";
  return null;
}

export function toRegionalPrices(prices: ProductPrice[], bookSaleDiscountPercentage: number): RegionalPrice[] {
  return prices.map((p) => ({
    currencyCode: p.currencyCode as CurrencyCode,
    regularPrice: p.regularPrice,
    salePrice: calculateBookSalePrice(p.regularPrice, bookSaleDiscountPercentage, p.currencyCode as CurrencyCode),
    saleStartDate: p.saleStartDate?.toISOString(),
    saleEndDate: p.saleEndDate?.toISOString(),
    isDefault: p.isDefault,
    isActive: p.isActive,
  }));
}

/** Purchasable variants in display order. Incomplete or disabled formats
 * are left out entirely — the storefront never sees them. */
export function buildProductVariants(product: FormatSource, bookSaleDiscountPercentage: number): ProductVariant[] {
  const variants: ProductVariant[] = [];

  for (const format of ["COLOUR_PDF", "BW_PDF"] as const) {
    if (!isPdfFormatAvailable(product, format)) continue;
    variants.push({
      id: variantId(product.id, format),
      format,
      prices: toRegionalPrices(pricesForFormat(product, format), bookSaleDiscountPercentage),
    });
  }

  if (isFormatAvailable(product, "RENT_AND_READ", bookSaleDiscountPercentage)) {
    variants.push({
      id: variantId(product.id, "RENT_AND_READ"),
      format: "RENT_AND_READ",
      prices: [],
      rentalPrice: rentalPriceFor(product, bookSaleDiscountPercentage)!,
      rentalDurationDays: product.rentalDurationDays,
    });
  }

  return variants;
}
