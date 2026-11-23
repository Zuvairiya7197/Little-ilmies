import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/get-admin-session";

/** Shortest ADMIN_API_TOKEN accepted — a shorter value is ignored, so a
 * weak or placeholder token can never unlock the API. */
const MIN_TOKEN_LENGTH = 32;

interface RequireAdminApiOptions {
  /**
   * Also accept `Authorization: Bearer <ADMIN_API_TOKEN>` in place of an
   * admin login, for scripted book management (adding and editing books
   * and their files). Opt in per route: only routes that create, read or
   * update the catalogue pass this, never routes that delete anything,
   * touch orders/buyers, or change settings and passwords.
   */
  allowApiToken?: boolean;
}

/** True when the request carries the configured admin API token. */
async function hasValidApiToken() {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;

  const authorization = (await headers()).get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  if (!match) return false;

  const given = Buffer.from(match[1].trim());
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/** Returns a 403 NextResponse if the caller isn't an admin, else null. Use: `const denied = await requireAdminApi(); if (denied) return denied;` */
export async function requireAdminApi(options: RequireAdminApiOptions = {}) {
  if (options.allowApiToken && (await hasValidApiToken())) return null;

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}
