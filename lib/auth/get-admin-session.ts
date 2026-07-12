import { getAuthSession } from "@/lib/auth/get-session";

/** Returns the session only if the caller is an authenticated admin, else null. */
export async function getAdminSession() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}
