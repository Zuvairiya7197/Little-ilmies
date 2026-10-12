import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { storefrontSettingsSchema } from "@/lib/validation/admin-settings";
import { updateStorefrontSettings } from "@/lib/settings/storefront-settings";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

export async function PATCH(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = storefrontSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid storefront settings", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await updateStorefrontSettings(parsed.data);
  revalidateCatalogPaths();

  return NextResponse.json({ status: "ok" });
}
