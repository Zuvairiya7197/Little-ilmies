import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { categoryGroups } from "@/data/category-groups";

const siteUrl = process.env.SITE_URL ?? "https://littleilmies.com";

const staticRoutes = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/digital-delivery-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryGroupEntries: MetadataRoute.Sitemap = categoryGroups.map((group) => ({
    url: `${siteUrl}/shop/${group.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // If the DB is unreachable at build time, ship the sitemap with just
  // static + category-group routes rather than failing the whole build —
  // it regenerates on every request in production anyway.
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/shop/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...categoryGroupEntries, ...categoryEntries, ...productEntries];
  } catch {
    return [...staticEntries, ...categoryGroupEntries];
  }
}
