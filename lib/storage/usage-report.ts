import { prisma } from "@/lib/db/prisma";
import { listAllBlobStorageEntries, type BlobStorageEntry } from "@/lib/storage";

/** Who uses a stored file and as what, e.g. "ABC Book" / "Colour PDF". */
export interface StorageFileUse {
  owner: string;
  role: string;
  /** Admin page to manage the owner. */
  href: string;
  archived?: boolean;
}

export interface StorageFileEntry extends BlobStorageEntry {
  /** Empty = unused (nothing points at it). */
  usedBy: StorageFileUse[];
}

export interface StorageUsageGroup {
  prefix: "pdfs" | "previews" | "rentals" | "covers" | "other";
  totalBytes: number;
  fileCount: number;
  orphanedBytes: number;
  orphanedFiles: BlobStorageEntry[];
  /** Every file in this folder with its owner(s), for the "View all files" list. */
  files: StorageFileEntry[];
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
      select: {
        id: true,
        title: true,
        archivedAt: true,
        privatePdfPath: true,
        bwPrivatePdfPath: true,
        previewImagePaths: true,
        rentalPageImagePaths: true,
        coverImage: true,
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true, coverImage: true } }),
  ]);

  // pathname -> every place that points at it (a file can have several
  // uses, e.g. a colouring book's colour and B&W PDF sharing one file).
  const uses = new Map<string, StorageFileUse[]>();
  function addUse(pathname: string | null | undefined, use: StorageFileUse) {
    if (!pathname) return;
    uses.set(pathname, [...(uses.get(pathname) ?? []), use]);
  }
  for (const product of products) {
    const base = {
      owner: product.title,
      href: `/admin/products/${product.id}`,
      archived: Boolean(product.archivedAt),
    };
    addUse(product.privatePdfPath, { ...base, role: "Colour PDF" });
    addUse(product.bwPrivatePdfPath, { ...base, role: "B&W PDF" });
    addUse(product.coverImage, { ...base, role: "Cover image" });
    product.previewImagePaths.forEach((p, i) => addUse(p, { ...base, role: `Preview page ${i + 1}` }));
    product.rentalPageImagePaths.forEach((p, i) => addUse(p, { ...base, role: `Rent & Read page ${i + 1}` }));
  }
  for (const category of categories) {
    addUse(category.coverImage, {
      owner: category.name,
      role: "Category cover",
      href: `/admin/categories/${category.id}`,
    });
  }

  const groupMap = new Map<StorageUsageGroup["prefix"], StorageUsageGroup>();
  for (const prefix of ["pdfs", "previews", "rentals", "covers", "other"] as const) {
    groupMap.set(prefix, { prefix, totalBytes: 0, fileCount: 0, orphanedBytes: 0, orphanedFiles: [], files: [] });
  }

  for (const entry of entries) {
    const group = groupMap.get(prefixOf(entry.pathname))!;
    group.totalBytes += entry.size;
    group.fileCount += 1;
    const usedBy = uses.get(entry.pathname) ?? [];
    group.files.push({ ...entry, usedBy });
    if (usedBy.length === 0) {
      group.orphanedBytes += entry.size;
      group.orphanedFiles.push(entry);
    }
  }

  const groups = Array.from(groupMap.values()).filter((g) => g.fileCount > 0);
  // Group each folder's list by owner, unused files first.
  for (const group of groups) {
    group.files.sort(
      (a, b) =>
        Number(a.usedBy.length > 0) - Number(b.usedBy.length > 0) ||
        (a.usedBy[0]?.owner ?? "").localeCompare(b.usedBy[0]?.owner ?? "") ||
        a.pathname.localeCompare(b.pathname, undefined, { numeric: true })
    );
  }

  return {
    totalBytes: entries.reduce((sum, e) => sum + e.size, 0),
    fileCount: entries.length,
    groups,
  };
}
