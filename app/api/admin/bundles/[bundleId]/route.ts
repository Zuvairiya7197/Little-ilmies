import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bundleFormSchema } from "@/lib/validation/admin-bundle";

interface RouteParams {
  params: Promise<{ bundleId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { bundleId } = await params;
  const parsed = bundleFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bundle data" }, { status: 400 });
  }

  const existingWithSlug = await prisma.bundle.findUnique({ where: { slug: parsed.data.slug } });
  if (existingWithSlug && existingWithSlug.id !== bundleId) {
    return NextResponse.json({ error: "A bundle with this slug already exists" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.bundleProduct.deleteMany({ where: { bundleId } }),
    prisma.bundle.update({
      where: { id: bundleId },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        bundlePriceInr: parsed.data.bundlePriceInr,
        bundlePriceUsd: parsed.data.bundlePriceUsd,
        products: { create: parsed.data.productIds.map((productId) => ({ productId })) },
      },
    }),
  ]);

  return NextResponse.json({ id: bundleId });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { bundleId } = await params;
  await prisma.bundle.delete({ where: { id: bundleId } });
  return NextResponse.json({ status: "deleted" });
}
