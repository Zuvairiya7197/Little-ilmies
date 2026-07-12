import type { CurrencyCode } from "@/types/pricing";

export type OrderStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export interface OrderSummaryItem {
  productId: string;
  slug: string;
  title: string;
  coverImage: string;
  unitPrice: number;
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
  purchasedAt: string; // ISO date
  downloadCount: number;
}
