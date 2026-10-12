import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export const HARDCOVER_COMING_SOON_ENABLED_KEY = "HARDCOVER_COMING_SOON_ENABLED";

export interface StorefrontSettings {
  /** Global switch for the "Hardcover · Coming Soon" card. Turn off (or
   * repurpose) when physical book sales launch. Each book can still hide
   * the card via Product.hardcoverComingSoon. */
  hardcoverComingSoonEnabled: boolean;
}

export const defaultStorefrontSettings: StorefrontSettings = {
  hardcoverComingSoonEnabled: true,
};

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  noStore();
  const row = await prisma.appSetting.findUnique({ where: { key: HARDCOVER_COMING_SOON_ENABLED_KEY } });
  return {
    hardcoverComingSoonEnabled: row ? row.value === "true" : defaultStorefrontSettings.hardcoverComingSoonEnabled,
  };
}

export async function updateStorefrontSettings(settings: StorefrontSettings) {
  await prisma.appSetting.upsert({
    where: { key: HARDCOVER_COMING_SOON_ENABLED_KEY },
    update: { value: String(settings.hardcoverComingSoonEnabled) },
    create: { key: HARDCOVER_COMING_SOON_ENABLED_KEY, value: String(settings.hardcoverComingSoonEnabled) },
  });
}
