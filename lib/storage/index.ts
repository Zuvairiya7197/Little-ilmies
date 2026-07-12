import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Local-disk private file storage. Every function here is the seam that
 * gets swapped for Cloudflare R2 in production — callers (the download
 * route, admin upload routes) never touch the filesystem directly, only
 * this module. Swapping storage backends later means rewriting this file
 * only, not any call site.
 *
 * Security invariant: nothing under PRIVATE_UPLOADS_DIR is ever served by
 * a public static route. Full PDFs only ever leave this module through
 * streamPrivatePdf(), called from the access-controlled
 * /api/download/[productId] route after every ownership/payment check
 * passes.
 */

const PRIVATE_ROOT = path.resolve(process.env.PRIVATE_UPLOADS_DIR ?? "./private-uploads");
const PDFS_DIR = path.join(PRIVATE_ROOT, "pdfs");
const PREVIEWS_DIR = path.join(PRIVATE_ROOT, "previews");
const COVERS_DIR = path.join(PRIVATE_ROOT, "covers");

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

// ---------------------------------------------------------------------------
// Full PDFs — private, streamed only through the protected download route.
// ---------------------------------------------------------------------------

export async function savePrivatePdf(fileBuffer: Buffer, originalName: string): Promise<string> {
  await mkdir(PDFS_DIR, { recursive: true });
  const filename = safeFilename(originalName, ".pdf");
  const fullPath = assertWithin(PDFS_DIR, path.join(PDFS_DIR, filename));
  await writeFile(fullPath, fileBuffer);
  // Stored/returned path is relative to PRIVATE_ROOT so it's portable
  // across environments and never leaks the absolute disk path.
  return path.relative(PRIVATE_ROOT, fullPath);
}

export async function getPrivatePdf(relativePath: string): Promise<Buffer> {
  const fullPath = assertWithin(PDFS_DIR, path.join(PRIVATE_ROOT, relativePath));
  return readFile(fullPath);
}

/** Returns a Node.js ReadStream for the given private PDF, for efficient streaming responses. */
export async function streamPrivatePdf(relativePath: string) {
  const fullPath = assertWithin(PDFS_DIR, path.join(PRIVATE_ROOT, relativePath));
  const stats = await stat(fullPath); // throws if missing — route treats as 404
  return { stream: createReadStream(fullPath), size: stats.size };
}

export async function deletePrivatePdf(relativePath: string): Promise<void> {
  const fullPath = assertWithin(PDFS_DIR, path.join(PRIVATE_ROOT, relativePath));
  await unlink(fullPath).catch(() => {}); // idempotent
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
  return Promise.all(
    relativePaths.map((p) => readFile(assertWithin(PREVIEWS_DIR, path.join(PRIVATE_ROOT, p))))
  );
}

// ---------------------------------------------------------------------------
// Cover images — used on public product cards, so these are the one asset
// type that's fine to mirror into /public at upload time (admin route's
// job); this module just manages the private-storage copy used as the
// source of truth.
// ---------------------------------------------------------------------------

export async function saveCoverImage(fileBuffer: Buffer, originalName: string): Promise<string> {
  await mkdir(COVERS_DIR, { recursive: true });
  const ext = path.extname(originalName) || ".jpg";
  const filename = safeFilename(originalName, ext);
  const fullPath = assertWithin(COVERS_DIR, path.join(COVERS_DIR, filename));
  await writeFile(fullPath, fileBuffer);
  return path.relative(PRIVATE_ROOT, fullPath);
}

export async function getCoverImage(relativePath: string): Promise<Buffer> {
  const fullPath = assertWithin(COVERS_DIR, path.join(PRIVATE_ROOT, relativePath));
  return readFile(fullPath);
}
