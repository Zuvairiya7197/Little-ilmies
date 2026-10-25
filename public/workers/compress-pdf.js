/**
 * Compresses an admin-uploaded PDF in the browser with Ghostscript
 * (WebAssembly build), before it goes straight to B2. Runs as a Web Worker
 * so the admin page stays responsive. See lib/admin/compress-pdf.ts.
 *
 * Ghostscript is ~16 MB, so it's loaded from jsDelivr (pinned version)
 * rather than deployed with the site, and each file's SHA-256 is checked
 * before it runs — a changed or tampered file is refused.
 *
 * Message in:  { buffer: ArrayBuffer }
 * Messages out: { type: "progress", page, pageCount }
 *               { type: "done", buffer: ArrayBuffer }
 *               { type: "error", message }
 */

const GS_BASE = "https://cdn.jsdelivr.net/npm/@jspawn/ghostscript-wasm@0.0.2/";
const GS_JS_SHA256 = "a42012ee915fff68dda2a13daee367f2af681d616a2af012e7520beea1086ad7";
const GS_WASM_SHA256 = "4dceaac93a7586722d76c48cf8632fdac8407db4400bdb9772eebf61758d4161";

// /printer keeps images at print resolution (up to 300 dpi) and leaves text
// as real text. Ghostscript copies JPEG images through untouched by default,
// so a book Canva already exported as JPEG barely shrank (Beginner I:
// 25.5 → 22.0 MB); re-saving them at /printer quality gets 14.1 MB with no
// visible change. Books with lossless or CMYK images are unaffected.
const GS_ARGS = [
  "-dNOPAUSE",
  "-dBATCH",
  "-dSAFER",
  "-sDEVICE=pdfwrite",
  "-dCompatibilityLevel=1.6",
  "-dPDFSETTINGS=/printer",
  "-dPassThroughJPEGImages=false",
  "-sOutputFile=/out.pdf",
  "/in.pdf",
];

async function fetchVerified(file, expectedSha256) {
  const res = await fetch(GS_BASE + file);
  if (!res.ok) throw new Error(`Could not load ${file} (${res.status})`);
  const bytes = await res.arrayBuffer();
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const hex = Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex !== expectedSha256) throw new Error(`${file} failed its integrity check`);
  return bytes;
}

let ghostscriptFactory = null;

async function loadGhostscript() {
  if (ghostscriptFactory) return ghostscriptFactory;
  const [js, wasm] = await Promise.all([
    fetchVerified("gs.js", GS_JS_SHA256),
    fetchVerified("gs.wasm", GS_WASM_SHA256),
  ]);
  const url = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
  try {
    importScripts(url); // defines self.Module (the Ghostscript factory)
  } finally {
    URL.revokeObjectURL(url);
  }
  const factory = self.Module;
  ghostscriptFactory = (options) =>
    factory({
      ...options,
      instantiateWasm(imports, done) {
        WebAssembly.instantiate(wasm, imports).then((result) => done(result.instance));
        return {};
      },
    });
  return ghostscriptFactory;
}

self.onmessage = async (event) => {
  try {
    const createGhostscript = await loadGhostscript();
    let pageCount = 0;
    // This build ignores Module.print and writes Ghostscript's output to
    // console.log (captured when it starts), so read progress from there.
    // Safe to replace: this worker's console is its own.
    console.log = (line) => {
      const total = /^Processing pages \d+ through (\d+)\./.exec(line);
      if (total) pageCount = Number(total[1]);
      const page = /^Page (\d+)$/.exec(line);
      if (page) self.postMessage({ type: "progress", page: Number(page[1]), pageCount });
    };
    const gs = await createGhostscript({});
    gs.FS.writeFile("/in.pdf", new Uint8Array(event.data.buffer));
    const exitCode = gs.callMain(GS_ARGS);
    if (exitCode !== 0) throw new Error(`Ghostscript exited with code ${exitCode}`);
    const out = gs.FS.readFile("/out.pdf");
    self.postMessage({ type: "done", buffer: out.buffer }, [out.buffer]);
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : String(error) });
  }
};
