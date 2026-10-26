import { coverThumbPath } from "@/lib/cover-thumb";
import { prepareCoverImages } from "@/lib/admin/compress-image";
import { getPresignedUploadUrl, removeUnattachedUpload, uploadToPresignedUrl } from "@/lib/admin/direct-upload";

type CoverOwner = { productId: string } | { categoryId: string } | { bundleId: string };

/**
 * Uploads a book, category or bundle cover. Normally the browser makes the WebP
 * cover and its small copy and sends both straight to B2, so the image
 * never passes through (or uses CPU on) a Vercel function. SVGs, browsers
 * that can't encode WebP, and deployments without B2 fall back to the old
 * route, where the server compresses the cover itself.
 */
export async function uploadCover(owner: CoverOwner, file: File): Promise<void> {
  const [ownerField, ownerId] = Object.entries(owner)[0] as [keyof CoverOwner, string];
  const endpoint =
    "productId" in owner
      ? "/api/admin/products/upload-cover"
      : "categoryId" in owner
        ? "/api/admin/categories/upload-cover"
        : "/api/admin/bundles/upload-cover";

  const prepared = await prepareCoverImages(file);
  const key = prepared ? coverPathname(ownerId, file.name) : null;
  const thumbKey = key ? coverThumbPath(key) : null;

  let uploadUrl: string | null = null;
  if (prepared && key) {
    uploadUrl = await getPresignedUploadUrl({
      kind: "cover",
      ...owner,
      key,
      contentType: "image/webp",
      fileSize: prepared.cover.size,
    })
      .then((result) => result.uploadUrl)
      // B2 isn't set up here (e.g. local dev): let the server store it.
      .catch(() => null);
  }

  if (!prepared || !key || !uploadUrl) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append(ownerField, ownerId);
    const res = await fetch(endpoint, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await errorMessage(res));
    return;
  }

  try {
    await uploadToPresignedUrl(uploadUrl, prepared.cover, "image/webp", () => {});
    // The small copy is optional — the site falls back to the full cover.
    if (thumbKey) {
      await getPresignedUploadUrl({ kind: "cover", ...owner, key: thumbKey, contentType: "image/webp", fileSize: prepared.thumb.size })
        .then(({ uploadUrl: thumbUrl }) => uploadToPresignedUrl(thumbUrl, prepared.thumb, "image/webp", () => {}))
        .catch(() => {});
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...owner, pathname: key }),
    });
    if (!res.ok) throw new Error(await errorMessage(res));
  } catch (error) {
    await Promise.all([key, thumbKey].filter((path): path is string => Boolean(path)).map(removeUnattachedUpload));
    throw error;
  }
}

function coverPathname(ownerId: string, filename: string) {
  const base = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 80);
  return `covers/${ownerId}/${base || "cover"}-${crypto.randomUUID()}.webp`;
}

async function errorMessage(res: Response) {
  const data = res.headers.get("content-type")?.includes("application/json") ? await res.json().catch(() => null) : null;
  return data?.error ?? `Could not upload cover image (${res.status}).`;
}
