import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCoverImage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

function contentTypeFor(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { coverImage: true },
  });

  if (!category?.coverImage || !category.coverImage.startsWith("covers/")) {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }

  try {
    const buffer = await getCoverImage(category.coverImage);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor(category.coverImage),
        // Same rationale as /api/product-assets/covers — let the edge
        // cache this so repeat storefront traffic doesn't re-hit B2.
        "Cache-Control": "public, max-age=31536000, immutable, s-maxage=31536000",
      },
    });
  } catch {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }
}
