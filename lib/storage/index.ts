import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  getB2Bucket,
  getB2Client,
  isB2Configured,
} from "@/lib/storage/b2Client";

/**
 * Private file storage wrapper. In production, files are stored in
 * Backblaze B2 (S3-compatible). Locally, if B2 env vars aren't set, files
 * fall back to local disk. Callers never touch the underlying storage
 * provider directly.
 *
 * Security invariant: nothing under PRIVATE_UPLOADS_DIR is ever served by
 * a public static route. Full PDFs only ever leave this module through
 * streamPrivatePdf(), called from the access-controlled
 * /api/download/[productId] route after every ownership/payment check
 * passes.
 */

const PRIVATE_ROOT = path.resolve(process.env.PRIVATE_UPLOADS_DIR ?? path.join("/tmp", "private-uploads"));
const PDFS_DIR = path.join(PRIVATE_ROOT, "pdfs");
const PREVIEWS_DIR = path.join(PRIVATE_ROOT, "previews");
const COVERS_DIR = path.join(PRIVATE_ROOT, "covers");
const RENTALS_DIR = path.join(PRIVATE_ROOT, "rentals");

const USE_B2_STORAGE = isB2Configured();

export function isUsingBlobStorage() {
  return USE_B2_STORAGE;
}

/** Prevents path traversal — every stored path must resolve inside its own subdirectory. */
function assertWithin(root: string, target: string) {
  const resolved = path.resolve(target);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`Refusing to access path outside ${root}: ${resolved}`);
  }
  return resolved;
}

function safeFilename(originalName: string, extension: string) {
  const base = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 80);
  return `${base}-${randomUUID()}${extension}`;
}

function contentTypeFor(filename: string, fallback = "application/octet-stream") {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return fallback;
}

async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const client = getB2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getB2Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

async function getObjectBuffer(key: string): Promise<Buffer> {
  const client = getB2Client();
  const result = await client.send(new GetObjectCommand({ Bucket: getB2Bucket(), Key: key }));
  if (!result.Body) {
    throw new Error(`B2 object not found or empty: ${key}`);
  }
  const bytes = await result.Body.transformToByteArray();
  return Buffer.from(bytes);
}

async function getObjectStream(key: string): Promise<{ stream: Readable; size: number }> {
  const client = getB2Client();
  const result = await client.send(new GetObjectCommand({ Bucket: getB2Bucket(), Key: key }));
  if (!result.Body) {
    throw new Error(`B2 object not found or empty: ${key}`);
  }
  // Body is a web ReadableStream in the AWS SDK v3 Node runtime by default;
  // normalize to a Node Readable for consistent use in route handlers.
  const stream = result.Body.transformToWebStream
    ? Readable.fromWeb(result.Body.transformToWebStream() as unknown as Parameters<typeof Readable.fromWeb>[0])
    : (result.Body as unknown as Readable);
  return { stream, size: result.ContentLength ?? 0 };
}

async function deleteObject(key: string): Promise<void> {
  const client = getB2Client();
  await client.send(new DeleteObjectCommand({ Bucket: getB2Bucket(), Key: key }));
}

// ---------------------------------------------------------------------------
// Full PDFs — private, streamed only through the protected download route.
// ---------------------------------------------------------------------------

export async function savePrivatePdf(fileBuffer: Buffer, originalName: string): Promise<string> {
  if (USE_B2_STORAGE) {
    const key = `pdfs/${safeFilename(originalName, ".pdf")}`;
    await putObject(key, fileBuffer, "application/pdf");
    return key;
  }

  await mkdir(PDFS_DIR, { recursive: true });
  const filename = safeFilename(originalName, ".pdf");
  const fullPath = assertWithin(PDFS_DIR, path.join(PDFS_DIR, filename));
  await writeFile(fullPath, fileBuffer);
  // Stored/returned path is relative to PRIVATE_ROOT so it's portable
  // across environments and never leaks the absolute disk path.
  return path.relative(PRIVATE_ROOT, fullPath);
}

export async function getPrivatePdf(relativePath: string): Promise<Buffer> {
  if (USE_B2_STORAGE) {
    return getObjectBuffer(relativePath);
  }

  const fullPath = assertWithin(PDFS_DIR, path.join(PRIVATE_ROOT, relativePath));
  return readFile(fullPath);
}

/** Returns a Node.js ReadStream for the given private PDF, for efficient streaming responses. */
export async function streamPrivatePdf(relativePath: string) {
  if (USE_B2_STORAGE) {
    return getObjectStream(relativePath);
  }

  const fullPath = assertWithin(PDFS_DIR, path.join(PRIVATE_ROOT, relativePath));
  const stats = await stat(fullPath); // throws if missing — route treats as 404
  return { stream: createReadStream(fullPath), size: stats.size };
}

export async function deletePrivatePdf(relativePath: string): Promise<void> {
  if (USE_B2_STORAGE) {
    await deleteObject(relativePath).catch(() => {});
    return;
  }

  const fullPath = assertWithin(PDFS_DIR, path.join(PRIVATE_ROOT, relativePath));
  await unlink(fullPath).catch(() => {}); // idempotent
}

export async function deletePreviewPages(relativePaths: string[]): Promise<void> {
  if (USE_B2_STORAGE) {
    await Promise.all(relativePaths.map((relativePath) => deleteObject(relativePath).catch(() => {})));
    return;
  }

  await Promise.all(
    relativePaths.map((relativePath) =>
      unlink(assertWithin(PREVIEWS_DIR, path.join(PRIVATE_ROOT, relativePath))).catch(() => {})
    )
  );
}

// ---------------------------------------------------------------------------
// Sample preview pages — private on disk, but safe to expose publicly since
// they're intentionally limited excerpts, not the full book. Served through
// their own lightweight route rather than /public so admin uploads don't
// need a public-folder write step.
// ---------------------------------------------------------------------------

export async function savePreviewPages(
  fileBuffers: Buffer[],
  baseName: string
): Promise<string[]> {
  if (USE_B2_STORAGE) {
    const paths: string[] = [];
    for (let i = 0; i < fileBuffers.length; i++) {
      const filename = safeFilename(`${baseName}-page-${i + 1}`, ".jpg");
      const key = `previews/${filename}`;
      await putObject(key, fileBuffers[i], "image/jpeg");
      paths.push(key);
    }
    return paths;
  }

  await mkdir(PREVIEWS_DIR, { recursive: true });
  const paths: string[] = [];
  for (let i = 0; i < fileBuffers.length; i++) {
    const filename = safeFilename(`${baseName}-page-${i + 1}`, ".jpg");
    const fullPath = assertWithin(PREVIEWS_DIR, path.join(PREVIEWS_DIR, filename));
    await writeFile(fullPath, fileBuffers[i]);
    paths.push(path.relative(PRIVATE_ROOT, fullPath));
  }
  return paths;
}

export async function getPreviewPages(relativePaths: string[]): Promise<Buffer[]> {
  if (USE_B2_STORAGE) {
    return Promise.all(relativePaths.map((p) => getObjectBuffer(p)));
  }

  return Promise.all(
    relativePaths.map((p) => readFile(assertWithin(PREVIEWS_DIR, path.join(PRIVATE_ROOT, p))))
  );
}

// ---------------------------------------------------------------------------
// Rent & Read full-book page images — private, and unlike preview pages
// NEVER safe to expose publicly: this is the entire book. Only ever served
// through /api/rentals/[productId]/pages/[page] after every rental
// entitlement check passes. Deliberately kept in their own "rentals/"
// storage prefix (not "previews/") so the public preview route's
// startsWith("previews/") path check can never resolve to a rental image.
// ---------------------------------------------------------------------------

export async function saveRentalPages(
  fileBuffers: Buffer[],
  baseName: string
): Promise<string[]> {
  if (USE_B2_STORAGE) {
    const paths: string[] = [];
    for (let i = 0; i < fileBuffers.length; i++) {
      const filename = safeFilename(`${baseName}-page-${i + 1}`, ".jpg");
      const key = `rentals/${filename}`;
      await putObject(key, fileBuffers[i], "image/jpeg");
      paths.push(key);
    }
    return paths;
  }

  await mkdir(RENTALS_DIR, { recursive: true });
  const paths: string[] = [];
  for (let i = 0; i < fileBuffers.length; i++) {
    const filename = safeFilename(`${baseName}-page-${i + 1}`, ".jpg");
    const fullPath = assertWithin(RENTALS_DIR, path.join(RENTALS_DIR, filename));
    await writeFile(fullPath, fileBuffers[i]);
    paths.push(path.relative(PRIVATE_ROOT, fullPath));
  }
  return paths;
}

export async function getRentalPage(relativePath: string): Promise<Buffer> {
  if (USE_B2_STORAGE) {
    return getObjectBuffer(relativePath);
  }

  return readFile(assertWithin(RENTALS_DIR, path.join(PRIVATE_ROOT, relativePath)));
}

/** Overwrites an existing rental page at its exact stored path — used to
 * replace an admin-uploaded page with a compressed version in place,
 * after the original was uploaded directly via a presigned URL. Unlike
 * saveRentalPages, this never generates a new filename. */
export async function putRentalPage(relativePath: string, fileBuffer: Buffer): Promise<void> {
  if (USE_B2_STORAGE) {
    await putObject(relativePath, fileBuffer, "image/jpeg");
    return;
  }

  const fullPath = assertWithin(RENTALS_DIR, path.join(PRIVATE_ROOT, relativePath));
  await writeFile(fullPath, fileBuffer);
}

export async function deleteRentalPages(relativePaths: string[]): Promise<void> {
  if (USE_B2_STORAGE) {
    await Promise.all(relativePaths.map((relativePath) => deleteObject(relativePath).catch(() => {})));
    return;
  }

  await Promise.all(
    relativePaths.map((relativePath) =>
      unlink(assertWithin(RENTALS_DIR, path.join(PRIVATE_ROOT, relativePath))).catch(() => {})
    )
  );
}

// ---------------------------------------------------------------------------
// Cover images — used on public product cards, so these are the one asset
// type that's fine to mirror into /public at upload time (admin route's
// job); this module just manages the private-storage copy used as the
// source of truth.
// ---------------------------------------------------------------------------

export async function saveCoverImage(fileBuffer: Buffer, originalName: string): Promise<string> {
  if (USE_B2_STORAGE) {
    const ext = path.extname(originalName) || ".jpg";
    const key = `covers/${safeFilename(originalName, ext)}`;
    await putObject(key, fileBuffer, contentTypeFor(originalName, "image/jpeg"));
    return key;
  }

  await mkdir(COVERS_DIR, { recursive: true });
  const ext = path.extname(originalName) || ".jpg";
  const filename = safeFilename(originalName, ext);
  const fullPath = assertWithin(COVERS_DIR, path.join(COVERS_DIR, filename));
  await writeFile(fullPath, fileBuffer);
  return path.relative(PRIVATE_ROOT, fullPath);
}

export async function getCoverImage(relativePath: string): Promise<Buffer> {
  if (USE_B2_STORAGE) {
    return getObjectBuffer(relativePath);
  }

  const fullPath = assertWithin(COVERS_DIR, path.join(PRIVATE_ROOT, relativePath));
  return readFile(fullPath);
}

export async function deleteCoverImage(relativePath: string): Promise<void> {
  if (!relativePath.startsWith("covers/")) return;

  if (USE_B2_STORAGE) {
    await deleteObject(relativePath).catch(() => {});
    return;
  }

  const fullPath = assertWithin(COVERS_DIR, path.join(PRIVATE_ROOT, relativePath));
  await unlink(fullPath).catch(() => {});
}

// ---------------------------------------------------------------------------
// Storage usage reporting — read-only, for the admin storage-usage page.
// ---------------------------------------------------------------------------

export interface BlobStorageEntry {
  pathname: string;
  size: number;
  uploadedAt: string;
}

/** Deletes one object by its exact key. Only for use after the caller has
 * independently verified the key is safe to remove (e.g. it's
 * unreferenced by any product) — this function does no such check
 * itself. No-op on the local-disk fallback, which has no orphan-cleanup
 * story of its own. */
export async function deleteBlobByPathname(pathname: string): Promise<void> {
  if (!USE_B2_STORAGE) return;
  await deleteObject(pathname);
}

/** Lists every object in the bucket, paginating through B2's
 * ListObjectsV2 API. Read-only — never deletes anything. Empty array when
 * not using B2 (local disk fallback). */
export async function listAllBlobStorageEntries(): Promise<BlobStorageEntry[]> {
  if (!USE_B2_STORAGE) return [];

  const client = getB2Client();
  const bucket = getB2Bucket();
  const entries: BlobStorageEntry[] = [];
  let continuationToken: string | undefined;

  do {
    const result = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken, MaxKeys: 1000 })
    );
    for (const object of result.Contents ?? []) {
      if (!object.Key) continue;
      entries.push({
        pathname: object.Key,
        size: object.Size ?? 0,
        uploadedAt: (object.LastModified ?? new Date()).toISOString(),
      });
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);

  return entries;
}
