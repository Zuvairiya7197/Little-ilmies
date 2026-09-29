import type { RegionalPrice } from "@/types/pricing";
import type { AgeGroup } from "@/lib/age-range";

export type Language = "English" | "Arabic" | "Hindi" | "Marathi";

export type ProductFormat = "PDF" | "Printable PDF" | "Interactive PDF";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  coverImage: string;
  bookCount: number;
  isFeaturedOnHomepage?: boolean;
  displayOrder?: number;
  iconKey?: string | null;
  accentColor?: string | null;
  /** Null/undefined for a top-level (parent) category. */
  parentId?: string | null;
  /** Populated only where the caller needs the hierarchy (e.g. admin forms,
   * nav-building) — a flat Category list from getAllCategories() leaves
   * this undefined rather than nesting every row. */
  children?: Category[];
}

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  author?: string;
  sku?: string;
  shortDescription: string;
  coverImage: string;
  /**
   * Manually curated regional prices (not FX-converted). Must include at
   * least an INR entry (home market) and a USD entry (isDefault: true,
   * the "international" fallback price shown when no country match exists).
   */
  prices: RegionalPrice[];
  category: Pick<Category, "slug" | "name">;
  categories?: Pick<Category, "slug" | "name">[];
  categorySlugs?: string[];
  /** Recommended ages — both null when the product has no age range. See lib/age-range.ts. */
  ageFrom: number | null;
  ageTo: number | null;
  ageOpenEnded: boolean;
  pageCount: number;
  language: Language;
  format: ProductFormat;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  hasFreePreview: boolean;
  rentAndReadEnabled?: boolean;
  /** True once the admin has uploaded Rent & Read page images for this
   * book — the reader has nothing to serve until then, so the storefront
   * hides the Rent & Read offer even if rentAndReadEnabled is on. Never
   * exposes the actual rentalPageImagePaths paths to the client. */
  hasRentalPages?: boolean;
  previewImages?: string[];
  tags?: string[];
  learningGoals?: string[];
  usageLicense?: "PERSONAL_USE" | "PERSONAL_CLASSROOM" | "COMMERCIAL_USE";
  licenseInfo?: string;
  baseCurrency?: import("@/types/pricing").CurrencyCode;
  productVersion?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
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

export interface BundleSummary {
  id: string;
  slug: string;
  name: string;
  description?: string;
  coverImage?: string;
  type?: "FIXED" | "CUSTOM";
  products: ProductSummary[];
  /** Manually curated regional bundle prices, same shape/philosophy as ProductSummary.prices. */
  prices: RegionalPrice[];
  customPrices?: {
    quantity: number;
    currencyCode: import("@/types/pricing").CurrencyCode;
    price: number;
    compareAtPrice?: number;
    enabled: boolean;
  }[];
  customBundleDiscountPercentage?: number;
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

export type ActivityType =
  | "Colouring"
  | "Tracing"
  | "Worksheets"
  | "Activities"
  | "Stories"
  | "Recipes"
  | "Reading"
  | "Learning";

export interface ProductFilters {
  categorySlugs?: string[];
  /** "Shop by Age" filter groups — matched by overlap, not equality. */
  ageGroups?: AgeGroup[];
  /** Exact child ages — ageFrom <= age <= ageTo (or open-ended). */
  ages?: number[];
  languages?: Language[];
  formats?: ProductFormat[];
  activityTypes?: ActivityType[];
  minPrice?: number;
  maxPrice?: number;
  minPageCount?: number;
  maxPageCount?: number;
  newArrivalsOnly?: boolean;
  bestsellersOnly?: boolean;
  featuredOnly?: boolean;
  onSaleOnly?: boolean;
  freePreviewOnly?: boolean;
  query?: string;
}
