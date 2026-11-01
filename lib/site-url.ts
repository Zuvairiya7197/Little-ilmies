/** SITE_URL without a trailing slash, so `${siteUrl}/path` never ends up
 * with a double slash. */
export function getSiteUrl(fallback = "https://littleilmies.com") {
  return (process.env.SITE_URL ?? fallback).replace(/\/+$/, "");
}
