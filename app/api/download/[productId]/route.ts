import { NextResponse, type NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/**
 * Protected PDF download route. Every check below must pass before any
 * file is streamed — see README security notes. Actual private-file
 * streaming (lib/storage) lands in Phase 5 alongside Cloudflare R2/local
 * disk storage; this route already enforces the full access-control
 * contract so that piece can be dropped in without touching auth logic.
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

  // TODO(Phase 5): stream from lib/storage.streamPrivatePdf(download.product.privatePdfPath)
  // instead of this placeholder, and increment download.downloadCount /
  // lastDownloadedAt on success.
  return NextResponse.json(
    { error: "PDF streaming is not implemented yet (Phase 5)" },
    { status: 501 }
  );
}
