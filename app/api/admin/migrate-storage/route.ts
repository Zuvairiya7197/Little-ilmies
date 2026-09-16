import { NextResponse, type NextRequest } from "next/server";
import { list } from "@vercel/blob";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { PutObjectCommand, getB2Bucket, getB2Client, isB2Configured } from "@/lib/storage/b2Client";

/**
 * ONE-TIME migration route: copies every file from the old Vercel Blob
 * store to Backblaze B2, server-to-server. Runs entirely inside this
 * Vercel deployment, where BLOB_READ_WRITE_TOKEN exists at runtime —
 * that token is never returned in any response and never leaves this
 * function. Admin-auth gated like every other /api/admin route.
 *
 * Does not delete anything from Vercel Blob — safe to re-run, and the
 * old files stay as a fallback until this route is deleted and the
 * migration is confirmed complete.
 *
 * DELETE THIS FILE after running the migration once successfully.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  if (!isB2Configured()) {
    return NextResponse.json({ error: "B2 is not configured on this deployment." }, { status: 503 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not available in this environment." }, { status: 503 });
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "true";

  const b2 = getB2Client();
  const bucket = getB2Bucket();

  const migrated: { pathname: string; size: number }[] = [];
  const failed: { pathname: string; error: string }[] = [];
  const skipped: { pathname: string; reason: string }[] = [];

  let cursor: string | undefined;
  let totalListed = 0;

  do {
    const result = await list({ cursor, limit: 1000 });
    for (const blob of result.blobs) {
      totalListed += 1;
      try {
        if (dryRun) {
          migrated.push({ pathname: blob.pathname, size: blob.size });
          continue;
        }

        const res = await fetch(blob.url);
        if (!res.ok || !res.body) {
          failed.push({ pathname: blob.pathname, error: `Fetch from Blob failed: ${res.status}` });
          continue;
        }
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await b2.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: blob.pathname,
            Body: buffer,
            ContentType: res.headers.get("content-type") ?? "application/octet-stream",
          })
        );

        migrated.push({ pathname: blob.pathname, size: buffer.length });
      } catch (error) {
        failed.push({ pathname: blob.pathname, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return NextResponse.json({
    dryRun,
    totalListed,
    migratedCount: migrated.length,
    failedCount: failed.length,
    migrated,
    failed,
    skipped,
  });
}
