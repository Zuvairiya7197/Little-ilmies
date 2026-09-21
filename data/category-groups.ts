/**
 * Legacy aliases for the old 3-group static taxonomy (islamic-books /
 * educational-books / gifts-games), superseded by the new 8-group DB-driven
 * Category hierarchy (Category.parentId — see prisma/schema.prisma and
 * lib/db/catalog.ts#getCategoryHierarchy). None of these 3 slugs exist as
 * real Category rows — they never did; they only ever lived here.
 *
 * Kept only so an old bookmarked/shared link like /shop/islamic-books
 * keeps resolving instead of 404ing: app/shop/[category]/page.tsx maps
 * each of these slugs to its closest live top-level category slug before
 * resolving (see LEGACY_GROUP_REDIRECTS there), and this file's
 * `legacyCategoryGroupSlugs` export feeds generateStaticParams / the
 * sitemap so those URLs keep working and stay indexed.
 */
export const legacyCategoryGroupSlugs = ["islamic-books", "educational-books", "gifts-games"] as const;
