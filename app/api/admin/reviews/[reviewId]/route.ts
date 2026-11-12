import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { reviewModerationSchema } from "@/lib/validation/review";
import { approveReview, rejectReview, ReviewChangedError } from "@/lib/reviews/moderate-review";

interface RouteParams {
  params: Promise<{ reviewId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { reviewId } = await params;
  const parsed = reviewModerationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    if (parsed.data.action === "approve") await approveReview(reviewId, new Date(parsed.data.seenUpdatedAt));
    else await rejectReview(reviewId);
  } catch (error) {
    if (error instanceof ReviewChangedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ id: reviewId });
}
