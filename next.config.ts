import type { NextConfig } from "next";

// Cover images and free-preview pages are served directly from this CDN
// domain (see lib/catalog-assets.ts) when configured — next/image needs
// it explicitly allowlisted or it refuses to optimize/render the remote
// URL. Unset by default, so this is a no-op until ASSETS_CDN_DOMAIN is set.
const cdnDomain = process.env.ASSETS_CDN_DOMAIN;

const nextConfig: NextConfig = {
  // @napi-rs/canvas ships a native .node binary (see lib/pdf-rasterize.ts)
  // that webpack can't parse as a module — this tells Next to require() it
  // at runtime instead of bundling it, same as sharp already needs.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  // pdf.js loads its worker (pdf.worker.mjs) via a runtime dynamic import
  // of a plain string path, which Vercel's build-time file tracer can't
  // follow — without this, the worker file is silently missing from the
  // deployed function and every render fails with "Cannot find module
  // .../pdf.worker.mjs". This explicitly tells the tracer to include it
  // for every route that might call lib/pdf-rasterize.ts.
  outputFileTracingIncludes: {
    "/api/admin/products/generate-pdf-page": ["node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: cdnDomain
      ? [{ protocol: "https", hostname: cdnDomain, pathname: "/**" }]
      : [],
  },
  // Re-enable once /shop, /product/[slug], /login, /wishlist, /checkout etc.
  // exist as real routes (Phase 2+) — typedRoutes rejects links to routes
  // that haven't been created yet.
  typedRoutes: false,
};

export default nextConfig;
