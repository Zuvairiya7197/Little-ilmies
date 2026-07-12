const siteUrl = process.env.SITE_URL ?? "https://littleilmies.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Little Ilmies",
    url: siteUrl,
    logo: `${siteUrl}/images/little_ilmies_logo.png`,
    description:
      "Little Ilmies helps Muslim parents nurture young hearts with authentic Islamic and educational e-books.",
    sameAs: ["https://instagram.com/littleilmies", "https://facebook.com/littleilmies"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@littleilmies.com",
      contactType: "customer service",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Little Ilmies",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function breadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: `${siteUrl}${entry.path}`,
    })),
  };
}
