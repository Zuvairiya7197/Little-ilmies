import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bundleFormSchema } from "@/lib/validation/admin-bundle";

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = bundleFormSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bundle data" }, { status: 400 });
  }

  const existing = await prisma.bundle.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A bundle with this slug already exists" }, { status: 409 });
  }

  const bundle = await prisma.bundle.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      bundlePriceInr: parsed.data.bundlePriceInr,
      bundlePriceUsd: parsed.data.bundlePriceUsd,
      products: { create: parsed.data.productIds.map((productId) => ({ productId })) },
    },
  });

  return NextResponse.json({ id: bundle.id }, { status: 201 });
}
