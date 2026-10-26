import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCoverImage } from "@/lib/storage";
import { assetNotFound, storageReadFailure } from "@/lib/storage/responses";

interface RouteParams {
  params: Promise<{ bundleId: string }>;
}

function contentTypeFor(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { bundleId } = await params;
  const bundle = await prisma.bundle.findUnique({
    where: { id: bundleId },
    select: { coverImage: true },
  });

  if (!bundle?.coverImage || !bundle.coverImage.startsWith("covers/")) {
    return assetNotFound("Cover not found");
  }

  try {
    const buffer = await getCoverImage(bundle.coverImage);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor(bundle.coverImage),
        // Same rationale as /api/product-assets/covers — let the edge
        // cache this so repeat storefront traffic doesn't re-hit B2.
        "Cache-Control": "public, max-age=31536000, immutable, s-maxage=31536000",
      },
    });
  } catch (error) {
    return storageReadFailure(error, "Bundle cover");
  }
}
