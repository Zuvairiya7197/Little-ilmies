import { createCanvas } from "@napi-rs/canvas";

// Renders PDF pages to images server-side, with no system binaries (no
// poppler/ghostscript) — safe on Vercel's serverless Node runtime. Uses
// pdfjs-dist's "legacy" build (targets non-browser Node environments)
// with @napi-rs/canvas standing in for the DOM <canvas> API pdf.js
// expects.

async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // pdf.js resolves its worker via a runtime dynamic import of a plain
  // relative-path string ("./pdf.worker.mjs"). Vercel's serverless build
  // traces file dependencies statically, so that string-based import is
  // invisible to it and the worker file doesn't make it into the deployed
  // function bundle ("Cannot find module .../pdf.worker.mjs"). A static
  // `import.meta.resolve` call on a literal specifier IS visible to the
  // tracer, so this makes sure the worker file is included and gives
  // pdf.js its real on-disk location up front instead of guessing it.
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  }
  return pdfjsLib;
}

// pageNumber is 1-indexed, matching pdf.js's own page numbering.
//
// Standard (non-embedded) font substitution isn't wired up here — pdf.js's
// bundled substitute glyphs don't load reliably in this Node build. Book
// PDFs exported from design tools (InDesign, Canva, etc.) embed their
// fonts as standard practice, so this only affects the rare PDF that
// relies on a system font instead: such a page still renders (pdf.js
// falls back to a generic glyph shape) rather than failing, just not with
// the exact intended typeface.
export async function rasterizePdfPage(
  pdfBuffer: Buffer,
  pageNumber: number,
  maxDimension: number
): Promise<Buffer> {
  const pdfjsLib = await loadPdfjs();

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
  const pdfjsLib = await loadPdfjs();
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
