import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { couponMinimumsSchema } from "@/lib/validation/admin-settings";
import { updateCouponMinimums } from "@/lib/settings/coupon-settings";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

export async function PATCH(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = couponMinimumsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid minimum order amounts", details: parsed.error.flatten() }, { status: 400 });
  }

  const { INR, USD, GBP, AED } = parsed.data;
  await updateCouponMinimums({
    INR: Math.round(INR * 100),
    USD: Math.round(USD * 100),
    GBP: Math.round(GBP * 100),
    AED: Math.round(AED * 100),
  });
  // Book pages show the minimum next to the review reward.
  revalidateCatalogPaths();

  return NextResponse.json({ status: "ok" });
}
