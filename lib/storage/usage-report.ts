import { prisma } from "@/lib/db/prisma";
import { listAllBlobStorageEntries, type BlobStorageEntry } from "@/lib/storage";

export interface StorageUsageGroup {
  prefix: "pdfs" | "previews" | "rentals" | "covers" | "other";
  totalBytes: number;
  fileCount: number;
  orphanedBytes: number;
  orphanedFiles: BlobStorageEntry[];
}

export interface StorageUsageReport {
  totalBytes: number;
  fileCount: number;
  groups: StorageUsageGroup[];
}

function prefixOf(pathname: string): StorageUsageGroup["prefix"] {
  const [first] = pathname.split("/");
  if (first === "pdfs" || first === "previews" || first === "rentals" || first === "covers") return first;
  return "other";
}

/**
 * Read-only report of everything in Blob storage, grouped by folder, with
 * "orphaned" files flagged — blobs no product currently references by
 * path. Orphans accumulate from replaced uploads (each upload-* route
 * deletes the product's *previous* file, but a file that was removed by
 * some other path, or left behind by an interrupted request, has nothing
 * pointing at it anymore) and are the safest thing to reclaim quota from,
 * since nothing on the live site links to them. Never deletes anything
 * itself — this is diagnostic only.
 */
export async function getStorageUsageReport(): Promise<StorageUsageReport> {
  const [entries, products, categories] = await Promise.all([
    listAllBlobStorageEntries(),
    prisma.product.findMany({
      select: { privatePdfPath: true, previewImagePaths: true, rentalPageImagePaths: true, coverImage: true },
    }),
    prisma.category.findMany({ select: { coverImage: true } }),
  ]);

  const referenced = new Set<string>();
  for (const product of products) {
    if (product.privatePdfPath) referenced.add(product.privatePdfPath);
    if (product.coverImage) referenced.add(product.coverImage);
    for (const p of product.previewImagePaths) referenced.add(p);
    for (const p of product.rentalPageImagePaths) referenced.add(p);
  }
  for (const category of categories) {
    if (category.coverImage) referenced.add(category.coverImage);
  }

  const groupMap = new Map<StorageUsageGroup["prefix"], StorageUsageGroup>();
  for (const prefix of ["pdfs", "previews", "rentals", "covers", "other"] as const) {
    groupMap.set(prefix, { prefix, totalBytes: 0, fileCount: 0, orphanedBytes: 0, orphanedFiles: [] });
  }

  for (const entry of entries) {
    const group = groupMap.get(prefixOf(entry.pathname))!;
    group.totalBytes += entry.size;
    group.fileCount += 1;
    if (!referenced.has(entry.pathname)) {
      group.orphanedBytes += entry.size;
      group.orphanedFiles.push(entry);
    }
  }

  const groups = Array.from(groupMap.values()).filter((g) => g.fileCount > 0);

  return {
    totalBytes: entries.reduce((sum, e) => sum + e.size, 0),
    fileCount: entries.length,
    groups,
  };
}
