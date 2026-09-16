import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getPreviewPages } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ productId: string; pageIndex: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { productId, pageIndex } = await params;
  const index = Number(pageIndex);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Preview page not found" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { previewImagePaths: true, status: true },
  });

  const previewPath = product?.previewImagePaths[index];
  if (!product || product.status !== "PUBLISHED" || !previewPath?.startsWith("previews/")) {
    return NextResponse.json({ error: "Preview page not found" }, { status: 404 });
  }

  try {
    const [buffer] = await getPreviewPages([previewPath]);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        // s-maxage lets Vercel's edge cache this response for every
        // visitor after the first, instead of re-downloading from B2 on
        // every single request — see the covers route for the full
        // rationale (this is what was quietly burning through B2's daily
        // download cap and showing up as broken images once it maxed out).
        "Cache-Control": "public, max-age=31536000, immutable, s-maxage=31536000",
      },
    });
  } catch {
    return NextResponse.json({ error: "Preview page not found" }, { status: 404 });
  }
}
