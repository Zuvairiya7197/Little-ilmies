import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { learningGoals } from "@/lib/learning-goals";

export const dynamic = "force-dynamic";

/**
 * Read-only catalogue overview for scripted book management (ADMIN_API_TOKEN):
 * the category and learning-goal ids a new book can use, plus every book's
 * id/slug/SKU so a script can check for clashes before creating one.
 */
export async function GET() {
  const denied = await requireAdminApi({ allowApiToken: true });
  if (denied) return denied;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { archivedAt: null },
      select: { id: true, slug: true, sku: true, title: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    categories,
    learningGoals: learningGoals.map((goal) => ({ slug: goal.slug, label: goal.label })),
    products,
  });
}
