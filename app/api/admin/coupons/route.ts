import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { couponFormSchema } from "@/lib/validation/admin-coupon";

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = couponFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 });
  }
  const { code, type, value, isActive, maxRedemptions, expiresAt } = parsed.data;

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type,
      value: type === "PERCENTAGE" ? Math.round(value) : Math.round(value * 100),
      isActive,
      maxRedemptions,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    },
  });

  return NextResponse.json({ id: coupon.id }, { status: 201 });
}
