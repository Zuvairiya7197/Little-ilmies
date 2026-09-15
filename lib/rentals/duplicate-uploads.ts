import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { getPreviewPages, getRentalPage } from "@/lib/storage";

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export interface DuplicateUploadCandidate {
  productId: string;
  slug: string;
  title: string;
  previewImagePaths: string[];
  rentalPageImagePaths: string[];
  /** Index into rentalPageImagePaths that each preview page (by position
   * in previewImagePaths) is a byte-for-byte duplicate of. */
  matchingRentalIndexes: number[];
}

/**
 * Finds products where the public preview images are byte-identical to
 * some of the private rental page images — the case this cleanup exists
 * for: an admin uploaded the same page twice before the "use rental pages
 * as preview" reuse feature existed. Read-only; never deletes anything.
 * Only flags a product when EVERY preview page has a matching rental
 * page, so a partial/coincidental match never gets offered for cleanup.
 */
export async function findDuplicateUploadCandidates(): Promise<DuplicateUploadCandidate[]> {
  const products = await prisma.product.findMany({
    where: {
      previewImagePaths: { isEmpty: false },
      rentalPageImagePaths: { isEmpty: false },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      previewImagePaths: true,
      rentalPageImagePaths: true,
    },
  });

  const candidates: DuplicateUploadCandidate[] = [];

  for (const product of products) {
    const [previewBuffers, rentalBuffers] = await Promise.all([
      getPreviewPages(product.previewImagePaths),
      Promise.all(product.rentalPageImagePaths.map((path) => getRentalPage(path))),
    ]);

    const rentalHashes = rentalBuffers.map(sha256);
    const previewHashes = previewBuffers.map(sha256);

    const matchingRentalIndexes = previewHashes.map((hash) => rentalHashes.indexOf(hash));

    const allMatched = matchingRentalIndexes.every((index) => index !== -1);
    if (!allMatched) continue;

    candidates.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      previewImagePaths: product.previewImagePaths,
      rentalPageImagePaths: product.rentalPageImagePaths,
      matchingRentalIndexes,
    });
  }

  return candidates;
}
