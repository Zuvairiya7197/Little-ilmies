import type { RegionalPrice } from "@/types/pricing";

export type AgeRange = "0-3" | "3-6" | "6-9" | "9-12" | "12+";

export type Language = "English" | "Arabic" | "Urdu" | "Hindi" | "Marathi";

export type ProductFormat = "PDF" | "Printable PDF" | "Interactive PDF";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  coverImage: string;
  bookCount: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  /**
   * Manually curated regional prices (not FX-converted). Must include at
   * least an INR entry (home market) and a USD entry (isDefault: true,
   * the "international" fallback price shown when no country match exists).
   */
  prices: RegionalPrice[];
  category: Pick<Category, "slug" | "name">;
  ageRange: AgeRange;
  pageCount: number;
  language: Language;
  format: ProductFormat;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  hasFreePreview: boolean;
  downloadCount: number;
  publishedAt: string; // ISO date
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string; // ISO date
  title: string;
  body: string;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  whatsInside: string[];
  learningBenefits: string[];
  bestFor: string[];
  previewImages: string[];
  reviews: ProductReview[];
  relatedSlugs: string[];
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "bestselling"
  | "alphabetical"
  | "most-downloaded"
  | "highest-rated";

export interface ProductFilters {
  categorySlugs?: string[];
  ageRanges?: AgeRange[];
  languages?: Language[];
  formats?: ProductFormat[];
  minPrice?: number;
  maxPrice?: number;
  minPageCount?: number;
  maxPageCount?: number;
  newArrivalsOnly?: boolean;
  bestsellersOnly?: boolean;
  onSaleOnly?: boolean;
  freePreviewOnly?: boolean;
  query?: string;
}
