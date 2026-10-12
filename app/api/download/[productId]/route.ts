import { NextResponse, type NextRequest } from "next/server";
import { Readable } from "node:stream";
import { getAuthSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/db/prisma";
import { getPrivatePdfDownloadUrl, streamPrivatePdf } from "@/lib/storage";
import { pdfPathForFormat } from "@/lib/product-formats";
import { storageReadFailure } from "@/lib/storage/responses";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/**
 * Protected PDF download route. Every check below must pass before any
 * file is streamed — see README security notes.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;
  // ?format=bw selects the black & white PDF; no param is the colour PDF,
  // which keeps every pre-existing download link working.
  const format = request.nextUrl.searchParams.get("format") === "bw" ? "BW_PDF" : "COLOUR_PDF";

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

  // 3 & 4. Customer owns this exact format of the product AND payment
  // status is verified. Rentals never create Download rows, so a renter
  // can't get here.
  const download = await prisma.download.findFirst({
    where: {
      productId,
      format,
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

  const pdfPath = pdfPathForFormat(download.product, format);
  if (!pdfPath) {
    return NextResponse.json(
      { error: "This product's file is not yet available" },
      { status: 404 }
    );
  }
  const fileName = format === "BW_PDF" ? `${download.product.slug}-black-and-white.pdf` : `${download.product.slug}.pdf`;

  const signedUrl = await getPrivatePdfDownloadUrl(pdfPath, fileName).catch(() => null);

  if (signedUrl) {
    await prisma.download.update({
      where: { id: download.id },
      data: { downloadCount: { increment: 1 }, lastDownloadedAt: new Date() },
    });
    // The URL expires in 5 minutes and is never cached, so it can't be
    // reused or shared beyond a single download.
    const response = NextResponse.redirect(signedUrl, 302);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  let file: Awaited<ReturnType<typeof streamPrivatePdf>>;
  try {
    file = await streamPrivatePdf(pdfPath);
  } catch (error) {
    return storageReadFailure(error, "This PDF");
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
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
