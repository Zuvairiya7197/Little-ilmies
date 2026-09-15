import { NextResponse, type NextRequest } from "next/server";
import { Readable } from "node:stream";
import { getAuthSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/db/prisma";
import { streamPrivatePdf } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { productId } = await params;
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rental = await prisma.rentalAccess.findFirst({
    where: {
      productId,
      rentalExpiresAt: { gt: new Date() },
      order: { userId: session.user.id, status: "PAID" },
    },
    include: { product: true },
  });

  if (!rental) {
    return NextResponse.json({ error: "No active rental access for this book" }, { status: 403 });
  }

  if (!rental.product.privatePdfPath) {
    return NextResponse.json({ error: "This book file is not yet available" }, { status: 404 });
  }

  let file: Awaited<ReturnType<typeof streamPrivatePdf>>;
  try {
    file = await streamPrivatePdf(rental.product.privatePdfPath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const webStream = Readable.toWeb(file.stream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.size),
      "Content-Disposition": `inline; filename="${rental.product.slug}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
