import type { MetadataRoute } from "next";

const siteUrl = process.env.SITE_URL ?? "https://littleilmies.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/account/",
        "/admin",
        "/admin/",
        "/api/",
        "/checkout",
        "/cart",
        "/login",
        "/payment-success",
        "/payment-failed",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
