import type { NextConfig } from "next";

// Cover images and free-preview pages are served directly from this CDN
// domain (see lib/catalog-assets.ts) when configured — next/image needs
// it explicitly allowlisted or it refuses to optimize/render the remote
// URL. Unset by default, so this is a no-op until ASSETS_CDN_DOMAIN is set.
const cdnDomain = process.env.ASSETS_CDN_DOMAIN;

const nextConfig: NextConfig = {
  images: {
    // WebP only: each extra format multiplies Vercel's billed Image
    // Optimization transformations (free tier = 5,000/month).
    formats: ["image/webp"],
    // Fewer candidate widths = fewer distinct transformations per image.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    // Keep optimized images cached for 31 days instead of Next's 60s
    // default, so the same image isn't re-transformed (and re-billed).
    minimumCacheTTL: 2678400,
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
