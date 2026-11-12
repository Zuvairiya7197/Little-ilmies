import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { giftedReviewSchema } from "@/lib/validation/review";
import { addGiftedReview } from "@/lib/reviews/moderate-review";

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = giftedReviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const review = await addGiftedReview(parsed.data);
  return NextResponse.json({ id: review.id }, { status: 201 });
}
