import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { couponFormSchema } from "@/lib/validation/admin-coupon";

interface RouteParams {
  params: Promise<{ couponId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { couponId } = await params;
  const parsed = couponFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 });
  }
  const { code, type, value, isActive, maxRedemptions, expiresAt } = parsed.data;

  const existingWithCode = await prisma.coupon.findUnique({ where: { code } });
  if (existingWithCode && existingWithCode.id !== couponId) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      code,
      type,
      value: type === "PERCENTAGE" ? Math.round(value) : Math.round(value * 100),
      isActive,
      maxRedemptions,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({ id: couponId });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { couponId } = await params;
  await prisma.coupon.delete({ where: { id: couponId } });
  return NextResponse.json({ status: "deleted" });
}
