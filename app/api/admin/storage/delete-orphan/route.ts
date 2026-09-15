import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteBlobByPathname } from "@/lib/storage";
import { z } from "zod";

const deleteOrphanSchema = z.object({ pathname: z.string().min(1) });

/**
 * Deletes exactly one orphaned Blob file — re-verifies here that no
 * product or category currently references the pathname before deleting,
 * rather than trusting the "orphaned" label the client is showing (which
 * could be stale if something changed since the report was generated).
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = deleteOrphanSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { pathname } = parsed.data;

    const [productMatch, categoryMatch] = await Promise.all([
      prisma.product.findFirst({
        where: {
          OR: [
            { privatePdfPath: pathname },
            { coverImage: pathname },
            { previewImagePaths: { has: pathname } },
            { rentalPageImagePaths: { has: pathname } },
          ],
        },
        select: { id: true },
      }),
      prisma.category.findFirst({ where: { coverImage: pathname }, select: { id: true } }),
    ]);

    if (productMatch || categoryMatch) {
      return NextResponse.json(
        { error: "This file is still referenced by a product or category — refusing to delete." },
        { status: 409 }
      );
    }

    await deleteBlobByPathname(pathname);
    return NextResponse.json({ status: "removed" });
  } catch (error) {
    console.error("Deleting orphaned storage file failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Could not delete file: ${error.message}` : "Could not delete file." },
      { status: 500 }
    );
  }
}
