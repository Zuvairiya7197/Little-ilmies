import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { pricingSettingsSchema } from "@/lib/validation/admin-settings";
import { updatePricingSettings } from "@/lib/settings/pricing-settings";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

export async function PATCH(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = pricingSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid pricing settings", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await updatePricingSettings(parsed.data);
  revalidateCatalogPaths();

  return NextResponse.json({ status: "ok" });
}
