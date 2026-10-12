import type { CurrencyCode } from "@/types/pricing";

export type OrderStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export interface OrderSummaryItem {
  productId?: string;
  bundleId?: string;
  type?: "PRODUCT" | "CUSTOM_BUNDLE" | "RENTAL";
  slug: string;
  title: string;
  coverImage: string;
  unitPrice: number;
  /** Format display name, e.g. "Black & White Printable PDF". */
  formatName?: string;
  selectedBooks?: { id: string; title: string }[];
  /** Only set when type === "RENTAL". */
  rentalExpiresAt?: string;
  rentalIsActive?: boolean;
}

export interface OrderRecord {
  id: string;
  createdAt: string; // ISO date
  currencyCode: CurrencyCode;
  totalAmount: number;
  status: OrderStatus;
  items: OrderSummaryItem[];
}

export interface DownloadRecord {
  orderId: string;
  productId: string;
  slug: string;
  title: string;
  coverImage: string;
  fileType: "PDF" | "Printable PDF" | "Interactive PDF";
  format: "COLOUR_PDF" | "BW_PDF";
  formatName: string;
  downloadHref: string;
  purchasedAt: string; // ISO date
  downloadCount: number;
}

export interface RentalRecord {
  orderId: string;
  productId: string;
  slug: string;
  title: string;
  coverImage: string;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}
