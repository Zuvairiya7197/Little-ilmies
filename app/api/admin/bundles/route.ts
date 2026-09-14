import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bundleFormSchema } from "@/lib/validation/admin-bundle";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { CURRENCIES } from "@/types/pricing";

function toMinorUnits(value: number | undefined) {
  return value == null ? undefined : Math.round(value * 100);
}

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

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds }, archivedAt: null },
    select: { id: true },
  });
  if (products.length !== new Set(parsed.data.productIds).size) {
    return NextResponse.json({ error: "One or more selected products are invalid" }, { status: 422 });
  }

  const bundle = await prisma.bundle.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      type: parsed.data.type,
      isActive: parsed.data.isActive,
      bundlePriceInr: toMinorUnits(parsed.data.bundlePriceInr),
      bundlePriceUsd: toMinorUnits(parsed.data.bundlePriceUsd),
      products: { create: parsed.data.productIds.map((productId) => ({ productId })) },
      customPrices:
        parsed.data.type === "CUSTOM"
          ? {
              create: parsed.data.sizePrices.flatMap((size) =>
                Object.keys(CURRENCIES).map((currencyCode) => ({
                  quantity: size.quantity,
                  currencyCode,
                  price: toMinorUnits(size.prices[currencyCode]) ?? 0,
                  compareAtPrice: toMinorUnits(size.compareAtPrices[currencyCode]),
                  enabled: size.enabled,
                }))
              ),
            }
          : undefined,
    },
  });

  revalidateCatalogPaths();
  return NextResponse.json({ id: bundle.id }, { status: 201 });
}
