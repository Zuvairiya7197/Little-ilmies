import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

const statusSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED"]) });

/** Change only a book's status (e.g. publish a draft from the products list),
 * without resending every field the way the full PATCH requires. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi({ allowApiToken: true });
  if (denied) return denied;

  const { productId } = await params;
  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current || current.archivedAt) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { status } = parsed.data;
  await prisma.product.update({
    where: { id: productId },
    data: {
      status,
      publishedAt: status === "PUBLISHED" && !current.publishedAt ? new Date() : current.publishedAt,
    },
  });

  revalidateCatalogPaths();
  return NextResponse.json({ id: productId, status });
}
