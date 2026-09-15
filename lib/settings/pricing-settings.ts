import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE = 20;
export const DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE = 15;

export const BOOK_SALE_DISCOUNT_PERCENTAGE_KEY = "BOOK_SALE_DISCOUNT_PERCENTAGE";
export const CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY = "CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE";

export interface PricingSettings {
  bookSaleDiscountPercentage: number;
  customBundleDiscountPercentage: number;
}

export const defaultPricingSettings: PricingSettings = {
  bookSaleDiscountPercentage: DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE,
  customBundleDiscountPercentage: DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE,
};

function parsePercentage(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : fallback;
}

export async function getPricingSettings(): Promise<PricingSettings> {
  noStore();
  const rows = await prisma.appSetting.findMany({
    where: {
      key: {
        in: [BOOK_SALE_DISCOUNT_PERCENTAGE_KEY, CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY],
      },
    },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  return {
    bookSaleDiscountPercentage: parsePercentage(
      byKey.get(BOOK_SALE_DISCOUNT_PERCENTAGE_KEY),
      DEFAULT_BOOK_SALE_DISCOUNT_PERCENTAGE
    ),
    customBundleDiscountPercentage: parsePercentage(
      byKey.get(CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY),
      DEFAULT_CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE
    ),
  };
}

export async function updatePricingSettings(settings: PricingSettings) {
  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: BOOK_SALE_DISCOUNT_PERCENTAGE_KEY },
      update: { value: String(settings.bookSaleDiscountPercentage) },
      create: { key: BOOK_SALE_DISCOUNT_PERCENTAGE_KEY, value: String(settings.bookSaleDiscountPercentage) },
    }),
    prisma.appSetting.upsert({
      where: { key: CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY },
      update: { value: String(settings.customBundleDiscountPercentage) },
      create: {
        key: CUSTOM_BUNDLE_DISCOUNT_PERCENTAGE_KEY,
        value: String(settings.customBundleDiscountPercentage),
      },
    }),
  ]);
}
