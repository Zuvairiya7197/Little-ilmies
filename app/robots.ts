import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

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
        "/read",
        "/read/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
