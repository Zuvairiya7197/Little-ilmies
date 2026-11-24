import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { learningGoals } from "@/lib/learning-goals";

export const dynamic = "force-dynamic";

/**
 * Read-only catalogue overview for scripted book management (ADMIN_API_TOKEN):
 * the category and learning-goal ids a new book can use, plus every book's
 * id/slug/SKU so a script can check for clashes before creating one, and the
 * bundles with their books and enabled sizes.
 */
export async function GET() {
  const denied = await requireAdminApi({ allowApiToken: true });
  if (denied) return denied;

  const [categories, products, bundles] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { archivedAt: null },
      select: { id: true, slug: true, sku: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bundle.findMany({
      select: {
        id: true, slug: true, name: true, description: true, type: true, isActive: true, coverImage: true,
        products: { select: { productId: true } },
        customPrices: { select: { quantity: true, enabled: true }, distinct: ["quantity"] },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    categories,
    learningGoals: learningGoals.map((goal) => ({ slug: goal.slug, label: goal.label })),
    products,
    bundles: bundles.map(({ products: bundleProducts, customPrices, ...bundle }) => ({
      ...bundle,
      productIds: bundleProducts.map((product) => product.productId),
      sizes: customPrices.filter((size) => size.enabled).map((size) => size.quantity).sort((a, b) => a - b),
    })),
  });
}
