import { prisma } from "@/lib/db/prisma";

export const DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE = 20;
export const DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE = 15;

export const BOOK_SALE_DISCOUNT_PERCENTAGE_KEY = "BOOK_SALE_DISCOUNT_PERCENTAGE";
export const CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY = "CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE";
export const BOOK_SALE_MODE_KEY = "BOOK_SALE_MODE";
export const BOOK_SALE_WINDOWS_KEY = "BOOK_SALE_WINDOWS";

/**
 * When the book sale applies:
 *   ALWAYS    — every day (the original behaviour, and the default).
 *   SCHEDULED — only inside one of the sale windows below.
 *   OFF       — never; every book sells at its regular price.
 * Custom bundles keep their own discount in every mode.
 */
export const BOOK_SALE_MODES = ["ALWAYS", "SCHEDULED", "OFF"] as const;
export type BookSaleMode = (typeof BOOK_SALE_MODES)[number];

/**
 * Sale windows are whole calendar days in the store's time zone, start and
 * end both included, so a sale switches on and off at midnight India time.
 */
export const SALE_TIME_ZONE = "Asia/Kolkata";

export interface SaleWindow {
  /** Shown to buyers, e.g. "Ramadan Sale". */
  name: string;
  /** First day of the sale, YYYY-MM-DD. */
  start: string;
  /** Last day of the sale (included), YYYY-MM-DD. */
  end: string;
  /** This sale's own discount; empty uses the book sale discount. */
  discountPercentage?: number | null;
}

export interface ActiveSale {
  /** The running sale window's name, or null when the sale is always on. */
  name: string | null;
  discountPercentage: number;
  /** Last day of the running window (YYYY-MM-DD), or null when always on. */
  endsOn: string | null;
}

export interface PricingSettings {
  /**
   * The book sale discount in force right now — what every price on the
   * site and at checkout uses. 0 outside a scheduled sale or when the sale
   * is off.
   */
  bookSaleDiscountPercentage: number;
  /** The book sale discount the admin set (for the settings form). */
  configuredBookSaleDiscountPercentage: number;
  customBundleDiscountPercentage: number;
  bookSaleMode: BookSaleMode;
  saleWindows: SaleWindow[];
  activeSale: ActiveSale | null;
}

/** What the admin saves; the "in force now" values are derived from it. */
export interface PricingSettingsInput {
  bookSaleDiscountPercentage: number;
  customBundleDiscountPercentage: number;
  bookSaleMode: BookSaleMode;
  saleWindows: SaleWindow[];
}

/**
 * Suggested seasonal calendar, used until the admin saves their own. Islamic
 * dates are estimates (moon sighting can move them by a day or two), so the
 * windows start a little early and end after Eid. About 90 sale days a year,
 * so the regular price stays the price most of the year.
 */
export const DEFAULT_SALE_WINDOWS: SaleWindow[] = [
  { name: "Winter Holiday Sale", start: "2026-12-18", end: "2027-01-03" },
  { name: "Ramadan & Eid Sale", start: "2027-02-01", end: "2027-03-14" },
  { name: "Eid al-Adha Sale", start: "2027-05-10", end: "2027-05-21" },
  { name: "Summer Holiday Sale", start: "2027-07-19", end: "2027-08-08" },
];

export const defaultPricingSettings: PricingSettings = {
  bookSaleDiscountPercentage: DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE,
  configuredBookSaleDiscountPercentage: DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE,
  customBundleDiscountPercentage: DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE,
  bookSaleMode: "ALWAYS",
  saleWindows: DEFAULT_SALE_WINDOWS,
  activeSale: { name: null, discountPercentage: DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE, endsOn: null },
};

function parsePercentage(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : fallback;
}

function parseMode(value: string | undefined): BookSaleMode {
  return BOOK_SALE_MODES.includes(value as BookSaleMode) ? (value as BookSaleMode) : "ALWAYS";
}

function parseWindows(value: string | undefined): SaleWindow[] {
  if (value == null) return DEFAULT_SALE_WINDOWS;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is SaleWindow =>
        typeof w?.name === "string" && /^\d{4}-\d{2}-\d{2}$/.test(w?.start) && /^\d{4}-\d{2}-\d{2}$/.test(w?.end)
    );
  } catch {
    return [];
  }
}

/** Today's date (YYYY-MM-DD) in the store's time zone. */
export function saleCalendarDate(now = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: SALE_TIME_ZONE }).format(now);
}

/** The sale running on `now`, or null when books sell at their regular price. */
export function resolveActiveSale(
  mode: BookSaleMode,
  configuredPercentage: number,
  windows: SaleWindow[],
  now = new Date()
): ActiveSale | null {
  if (mode === "OFF") return null;
  if (mode === "ALWAYS") {
    return configuredPercentage > 0 ? { name: null, discountPercentage: configuredPercentage, endsOn: null } : null;
  }

  const today = saleCalendarDate(now);
  const window = windows
    .filter((w) => w.start <= today && today <= w.end)
    .sort((a, b) => a.end.localeCompare(b.end))[0];
  if (!window) return null;
  const discountPercentage = window.discountPercentage ?? configuredPercentage;
  return discountPercentage > 0 ? { name: window.name, discountPercentage, endsOn: window.end } : null;
}

export async function getPricingSettings(now = new Date()): Promise<PricingSettings> {
  const rows = await prisma.appSetting.findMany({
    where: {
      key: {
        in: [
          BOOK_SALE_DISCOUNT_PERCENTAGE_KEY,
          CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY,
          BOOK_SALE_MODE_KEY,
          BOOK_SALE_WINDOWS_KEY,
        ],
      },
    },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const configuredBookSaleDiscountPercentage = parsePercentage(
    byKey.get(BOOK_SALE_DISCOUNT_PERCENTAGE_KEY),
    DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE
  );
  const bookSaleMode = parseMode(byKey.get(BOOK_SALE_MODE_KEY));
  const saleWindows = parseWindows(byKey.get(BOOK_SALE_WINDOWS_KEY));
  const activeSale = resolveActiveSale(bookSaleMode, configuredBookSaleDiscountPercentage, saleWindows, now);

  return {
    bookSaleDiscountPercentage: activeSale?.discountPercentage ?? 0,
    configuredBookSaleDiscountPercentage,
    customBundleDiscountPercentage: parsePercentage(
      byKey.get(CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY),
      DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE
    ),
    bookSaleMode,
    saleWindows,
    activeSale,
  };
}

function upsertSetting(key: string, value: string) {
  return prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

export async function updatePricingSettings(settings: PricingSettingsInput) {
  const windows = [...settings.saleWindows].sort((a, b) => a.start.localeCompare(b.start));
  await prisma.$transaction([
    upsertSetting(BOOK_SALE_DISCOUNT_PERCENTAGE_KEY, String(settings.bookSaleDiscountPercentage)),
    upsertSetting(CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY, String(settings.customBundleDiscountPercentage)),
    upsertSetting(BOOK_SALE_MODE_KEY, settings.bookSaleMode),
    upsertSetting(BOOK_SALE_WINDOWS_KEY, JSON.stringify(windows)),
  ]);
}
