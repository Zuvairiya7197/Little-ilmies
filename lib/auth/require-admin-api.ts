import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/get-admin-session";

/** Returns a 403 NextResponse if the caller isn't an admin, else null. Use: `const denied = await requireAdminApi(); if (denied) return denied;` */
export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}
