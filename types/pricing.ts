export type CurrencyCode = "INR" | "USD" | "GBP" | "AED";

export interface CurrencyDefinition {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** BCP 47 locale used purely for number formatting (grouping/decimals), never for conversion. */
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDefinition> = {
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", label: "US Dollar (International)", locale: "en-US" },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB" },
  AED: { code: "AED", symbol: "AED", label: "UAE Dirham", locale: "en-AE" },
};

/**
 * Manually curated regional price for one product in one currency.
 * This is NOT a live exchange-rate conversion — each entry is an
 * intentional, admin-set price point (e.g. INR 300 vs USD 4, not
 * INR 300 * some FX rate). Mirrors the future `product_prices` table.
 */
export interface RegionalPrice {
  currencyCode: CurrencyCode;
  /** Minor units (paise / cents / pence / fils) */
  regularPrice: number;
  salePrice?: number;
  /** True for the currency shown when no country match and no override exists (should be USD per spec). */
  isDefault?: boolean;
  isActive?: boolean;
}

/**
 * Maps ISO 3166-1 alpha-2 country codes to a currency code, for
 * auto-detection/display only — never used for FX math, and never the
 * final authority on checkout price (the backend re-verifies region).
 *
 * Launch scope is deliberately two regions: India and everyone else
 * ("International"). GBP/AED exist in the pricing model for later use
 * but are not wired into auto-detection yet — adding a country here
 * later is how you'd turn on a third verified region.
 */
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: "INR",
  // All other countries resolve to USD (the "international" price).
};

export const FALLBACK_CURRENCY: CurrencyCode = "USD";
