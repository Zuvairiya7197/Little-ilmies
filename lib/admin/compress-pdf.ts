import { PDFDocument } from "pdf-lib";

/**
 * Shrinks a PDF in the admin's browser before it's uploaded (see
 * public/workers/compress-pdf.js). Canva print exports are often 40% bigger
 * than they need to be, and every byte counts against Backblaze's free
 * daily download allowance each time a buyer downloads the book.
 *
 * Never blocks an upload: if compression fails, saves too little, or the
 * result doesn't have the same number of pages, the original file is
 * returned unchanged.
 */

/** Keep the compressed file only if it's at least this much smaller. */
const MIN_SAVING = 0.1;

export interface PdfCompressionResult {
  file: File;
  originalSize: number;
  /** False when the original is kept (see `reason`). */
  compressed: boolean;
  reason?: string;
}

export async function compressPdfInBrowser(
  file: File,
  onProgress: (percentage: number) => void = () => {}
): Promise<PdfCompressionResult> {
  const keepOriginal = (reason: string): PdfCompressionResult => ({
    file,
    originalSize: file.size,
    compressed: false,
    reason,
  });

  if (typeof Worker === "undefined") return keepOriginal("this browser can't run the compressor");

  let output: ArrayBuffer;
  try {
    output = await runWorker(await file.arrayBuffer(), onProgress);
  } catch (error) {
    console.error("PDF compression failed, uploading the original", error);
    return keepOriginal("compression failed");
  }

  if (output.byteLength > file.size * (1 - MIN_SAVING)) return keepOriginal("it was already small");

  try {
    const [before, after] = await Promise.all([
      PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true }),
      PDFDocument.load(output),
    ]);
    if (before.getPageCount() !== after.getPageCount()) return keepOriginal("the page count changed");
  } catch {
    return keepOriginal("the compressed file couldn't be checked");
  }

  return {
    file: new File([output], file.name, { type: "application/pdf", lastModified: file.lastModified }),
    originalSize: file.size,
    compressed: true,
  };
}

function runWorker(buffer: ArrayBuffer, onProgress: (percentage: number) => void): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("/workers/compress-pdf.js");
    const finish = () => worker.terminate();
    worker.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "progress" && message.pageCount > 0) {
        onProgress((message.page / message.pageCount) * 100);
      } else if (message.type === "done") {
        finish();
        resolve(message.buffer);
      } else if (message.type === "error") {
        finish();
        reject(new Error(message.message));
      }
    };
    worker.onerror = (event) => {
      finish();
      reject(new Error(event.message || "PDF compressor crashed"));
    };
    worker.postMessage({ buffer }, [buffer]);
  });
}
