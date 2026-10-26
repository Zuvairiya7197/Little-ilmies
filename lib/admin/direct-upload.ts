/**
 * Browser-to-B2 uploads for the admin dashboard: the server only signs a
 * short-lived upload link (/api/admin/products/client-upload), and the
 * file itself never passes through a Vercel function.
 */

export interface PresignedUploadRequest {
  kind: "pdf" | "preview" | "rental" | "cover";
  /** The book the file belongs to. */
  productId?: string;
  /** For category covers instead of a book. */
  categoryId?: string;
  /** For bundle covers instead of a book. */
  bundleId?: string;
  key: string;
  contentType: string;
  fileSize: number;
}

export async function getPresignedUploadUrl(params: PresignedUploadRequest): Promise<{ uploadUrl: string; key: string }> {
  const res = await fetch("/api/admin/products/client-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to get an upload URL.");
  }
  return res.json();
}

/** Uploads a file directly to a presigned B2 URL via XHR (not fetch) so
 * upload progress events are available for the progress bar UI. */
export function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (percentage: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
}

/** Best-effort removal of an upload that never got attached. The server
 * re-checks that nothing uses the file before deleting it. */
export async function removeUnattachedUpload(pathname: string) {
  await fetch("/api/admin/storage/delete-orphan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathname }),
  }).catch(() => {});
}
