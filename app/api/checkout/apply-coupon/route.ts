import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CouponError, couponMinimumFor, findUsableCoupon } from "@/lib/coupons/apply-coupon";
import { getAuthSession } from "@/lib/auth/get-session";

const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  email: z.string().trim().email(),
  currencyCode: z.string().length(3),
  /** The cart total the browser shows, for the minimum-order message. */
  subtotal: z.number().int().min(0),
});

/** Checks a coupon for the checkout preview. Only a preview — create-order
 * checks it again and computes the real discount itself. */
export async function POST(request: NextRequest) {
  const parsed = applyCouponSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email above, then the coupon code." }, { status: 400 });
  }

  try {
    const { code, email, currencyCode, subtotal } = parsed.data;
    const session = await getAuthSession();
    const coupon = await findUsableCoupon(code, email, currencyCode, subtotal, session?.user?.id);
    // The minimum is sent back so checkout can drop the coupon if the
    // buyer later removes books and falls below it.
    const minimum = await couponMinimumFor(currencyCode);
    return NextResponse.json({ code: coupon.code, type: coupon.type, value: coupon.value, minimum });
  } catch (error) {
    if (error instanceof CouponError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
