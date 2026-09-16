import type { NextConfig } from "next";

// Cover images and free-preview pages are served directly from this CDN
// domain (see lib/catalog-assets.ts) when configured — next/image needs
// it explicitly allowlisted or it refuses to optimize/render the remote
// URL. Unset by default, so this is a no-op until ASSETS_CDN_DOMAIN is set.
const cdnDomain = process.env.ASSETS_CDN_DOMAIN;

const nextConfig: NextConfig = {
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
