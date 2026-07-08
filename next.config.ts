import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Re-enable once /shop, /product/[slug], /login, /wishlist, /checkout etc.
  // exist as real routes (Phase 2+) — typedRoutes rejects links to routes
  // that haven't been created yet.
  typedRoutes: false,
};

export default nextConfig;
