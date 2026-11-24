import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getPricingSettings } from "@/lib/settings/pricing-settings";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

export const dynamic = "force-dynamic";

const LAST_STATE_KEY = "BOOK_SALE_LAST_STATE";

/**
 * Daily check (vercel.json cron, just after midnight India time) for the
 * seasonal book sale. Shop pages are cached for a day, so when a sale starts
 * or ends this clears them at once, keeping the prices people see in step
 * with what checkout charges. It only ever refreshes the cache, and only when
 * the sale has changed, so it is safe to leave unauthenticated.
 */
export async function GET() {
  const settings = await getPricingSettings();
  const sale = settings.activeSale;
  const state = sale ? `${sale.name ?? "always"}:${sale.discountPercentage}:${sale.endsOn ?? ""}` : "none";

  const previous = await prisma.appSetting.findUnique({ where: { key: LAST_STATE_KEY } });
  const changed = previous?.value !== state;
  if (changed) {
    revalidateCatalogPaths();
    await prisma.appSetting.upsert({
      where: { key: LAST_STATE_KEY },
      update: { value: state },
      create: { key: LAST_STATE_KEY, value: state },
    });
  }

  return NextResponse.json({ sale: sale ?? null, refreshed: changed });
}
