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
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Cover not found" }, { status: 404 });
  }
}
