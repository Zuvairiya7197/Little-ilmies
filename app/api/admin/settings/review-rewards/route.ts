import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { reviewRewardSettingsSchema } from "@/lib/validation/admin-settings";
import { updateReviewRewardSettings } from "@/lib/settings/review-reward-settings";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

export async function PATCH(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = reviewRewardSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review reward settings", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await updateReviewRewardSettings(parsed.data);
  // Book pages show the reward percentages.
  revalidateCatalogPaths();

  return NextResponse.json({ status: "ok" });
}
