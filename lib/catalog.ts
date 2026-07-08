import type { ProductFilters, ProductSummary, SortOption } from "@/types/catalog";
import type { CurrencyCode } from "@/types/pricing";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";

export function filterProducts(
  items: ProductSummary[],
  filters: ProductFilters,
  currency: CurrencyCode
): ProductSummary[] {
  return items.filter((p) => {
    const resolved = resolveProductPrice(p, currency);
    const price = resolved.salePrice ?? resolved.regularPrice;

    if (filters.categorySlugs?.length && !filters.categorySlugs.includes(p.category.slug)) {
      return false;
    }
    if (filters.ageRanges?.length && !filters.ageRanges.includes(p.ageRange)) {
      return false;
    }
    if (filters.languages?.length && !filters.languages.includes(p.language)) {
      return false;
    }
    if (filters.formats?.length && !filters.formats.includes(p.format)) {
      return false;
    }
    if (filters.minPrice !== undefined && price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    if (filters.minPageCount !== undefined && p.pageCount < filters.minPageCount) return false;
    if (filters.maxPageCount !== undefined && p.pageCount > filters.maxPageCount) return false;
    if (filters.newArrivalsOnly && !p.isNewArrival) return false;
    if (filters.bestsellersOnly && !p.isBestseller) return false;
    if (filters.onSaleOnly && !resolved.salePrice) return false;
    if (filters.freePreviewOnly && !p.hasFreePreview) return false;

    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      if (q) {
        const haystack = `${p.title} ${p.category.name} ${p.language} ${p.shortDescription}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
    }

    return true;
  });
}

export function sortProducts(
  items: ProductSummary[],
  sort: SortOption,
  currency: CurrencyCode
): ProductSummary[] {
  const sorted = [...items];
  const priceOf = (p: ProductSummary) => {
    const resolved = resolveProductPrice(p, currency);
    return resolved.salePrice ?? resolved.regularPrice;
  };

  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    case "price-asc":
      return sorted.sort((a, b) => priceOf(a) - priceOf(b));
    case "price-desc":
      return sorted.sort((a, b) => priceOf(b) - priceOf(a));
    case "bestselling":
      return sorted.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
    case "alphabetical":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "most-downloaded":
      return sorted.sort((a, b) => b.downloadCount - a.downloadCount);
    case "highest-rated":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return sorted;
  }
}

export const sortLabels: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  bestselling: "Best Selling",
  alphabetical: "Alphabetical",
  "most-downloaded": "Most Downloaded",
  "highest-rated": "Highest Rated",
};
