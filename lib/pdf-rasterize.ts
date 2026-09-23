import { createCanvas } from "@napi-rs/canvas";

/**
 * Renders one page of a PDF to a PNG buffer, server-side, with no system
 * binaries (no poppler/ghostscript) — safe on Vercel's serverless Node
 * runtime. Uses pdfjs-dist's "legacy" build (targets non-browser Node
 * environments) with @napi-rs/canvas standing in for the DOM <canvas> API
 * pdf.js expects.
 *
 * pageNumber is 1-indexed, matching pdf.js's own page numbering.
 *
 * Standard (non-embedded) font substitution isn't wired up here — pdf.js's
 * bundled substitute glyphs don't load reliably in this Node build. Book
 * PDFs exported from design tools (InDesign, Canva, etc.) embed their
 * fonts as standard practice, so this only affects the rare PDF that
 * relies on a system font instead: such a page still renders (pdf.js
 * falls back to a generic glyph shape) rather than failing, just not with
 * the exact intended typeface.
 */
export async function rasterizePdfPage(
  pdfBuffer: Buffer,
  pageNumber: number,
  maxDimension: number
): Promise<Buffer> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // No workerSrc is configured, so pdf.js falls back to running its
  // "worker" logic inline in this same Node process — no browser Worker
  // API available in a serverless function anyway.
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
  });

  try {
    const pdf = await loadingTask.promise;
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Page ${pageNumber} is out of range (document has ${pdf.numPages} pages)`);
    }

    const page = await pdf.getPage(pageNumber);
    try {
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = maxDimension / Math.max(unscaledViewport.width, unscaledViewport.height);
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
      const context = canvas.getContext("2d");

      await page.render({
        canvas: null,
        // @napi-rs/canvas's 2D context is API-compatible with the subset
        // pdf.js uses, but isn't the DOM type pdf.js's TS types expect.
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      return canvas.toBuffer("image/png");
    } finally {
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }
}

export async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
  });
  try {
    const pdf = await loadingTask.promise;
    return pdf.numPages;
  } finally {
    await loadingTask.destroy();
  }
}
