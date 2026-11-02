import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/get-session";
import { saveCartSnapshot } from "@/lib/db/cart";

const cartSnapshotSchema = z.object({
  productIds: z.array(z.string().min(1).max(64)).max(100),
});

/** Saves the signed-in buyer's cart contents — see lib/db/cart.ts. */
export async function PUT(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = cartSnapshotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await saveCartSnapshot(session.user.id, [...new Set(parsed.data.productIds)]);
  return NextResponse.json({ ok: true });
}
