import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCoverImage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

function contentTypeFor(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { coverImage: true },
  });

  if (!product || !product.coverImage.startsWith("covers/")) {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }

  try {
    const buffer = await getCoverImage(product.coverImage);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor(product.coverImage),
        // s-maxage lets Vercel's own edge cache this response and serve it
        // to every subsequent visitor without re-running this route (and
        // re-downloading from B2) at all — public max-age alone only
        // caches in each individual visitor's own browser, so every new
        // visitor's first load still had to hit B2 directly. Without this,
        // real storefront traffic could burn through B2's daily download
        // bandwidth cap fast, and once that cap is hit, B2 starts
        // rejecting every image request until it resets, showing up as
        // universally broken cover/preview images.
        "Cache-Control": "public, max-age=31536000, immutable, s-maxage=31536000",
      },
    });
  } catch {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }
}
