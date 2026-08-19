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
  saleStartDate?: string;
  saleEndDate?: string;
  /** True for the currency shown when no country match and no override exists (should be USD per spec). */
  isDefault?: boolean;
  isActive?: boolean;
}

/**
 * Maps ISO 3166-1 alpha-2 country codes to a currency code, for
 * auto-detection/display only — never used for FX math, and never the
 * final authority on checkout price (the backend re-verifies region).
 *
 * Countries using INR/GBP/AED resolve to their configured regional currency.
 * Countries where USD is the official or store-supported selling currency
 * resolve explicitly to USD. Everything else also falls back to USD as the
 * international price.
 */
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: "INR",
  GB: "GBP",
  AE: "AED",
  US: "USD",
  AS: "USD",
  GU: "USD",
  MP: "USD",
  PR: "USD",
  VI: "USD",
  UM: "USD",
  EC: "USD",
  SV: "USD",
  PA: "USD",
  TL: "USD",
  FM: "USD",
  MH: "USD",
  PW: "USD",
  VG: "USD",
  TC: "USD",
  // All other countries resolve to USD (the "international" price).
};

export const FALLBACK_CURRENCY: CurrencyCode = "USD";
