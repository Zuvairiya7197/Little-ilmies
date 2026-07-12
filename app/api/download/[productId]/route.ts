import { NextResponse, type NextRequest } from "next/server";
import { Readable } from "node:stream";
import { getAuthSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/db/prisma";
import { streamPrivatePdf } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/**
 * Protected PDF download route. Every check below must pass before any
 * file is streamed — see README security notes.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;

  // 1. Customer is logged in
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  // 2. Customer email is verified — Auth.js only creates a session after
  // the magic link is clicked, which is itself the verification, but we
  // also check emailVerified explicitly for defense in depth.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.emailVerified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  // 3 & 4. Customer owns the purchased product AND payment status is verified
  const download = await prisma.download.findFirst({
    where: {
      productId,
      order: { userId, status: "PAID" },
    },
    include: { product: true },
  });

  // 5. Download access exists
  if (!download) {
    return NextResponse.json({ error: "No download access for this product" }, { status: 403 });
  }

  if (download.expiresAt && download.expiresAt < new Date()) {
    return NextResponse.json({ error: "Download access has expired" }, { status: 410 });
  }

  if (!download.product.privatePdfPath) {
    return NextResponse.json(
      { error: "This product's file is not yet available" },
      { status: 404 }
    );
  }

  let file: Awaited<ReturnType<typeof streamPrivatePdf>>;
  try {
    file = await streamPrivatePdf(download.product.privatePdfPath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  await prisma.download.update({
    where: { id: download.id },
    data: { downloadCount: { increment: 1 }, lastDownloadedAt: new Date() },
  });

  const webStream = Readable.toWeb(file.stream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${download.product.slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
