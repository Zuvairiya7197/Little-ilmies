import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@/types/catalog";
import { variantId, type PdfFormat } from "@/lib/formats";

export interface CartItem {
  cartItemId?: string;
  type?: "PRODUCT" | "CUSTOM_BUNDLE" | "RENTAL" | "UPGRADE";
  productId: string;
  bundleId?: string;
  slug: string;
  title: string;
  coverImage: string;
  /** PDF format for PRODUCT/UPGRADE lines. Missing on carts saved before
   * formats existed — those lines are the colour PDF. */
  format?: PdfFormat;
  /** Display prices of the selected variant (checkout re-prices). */
  prices?: ProductSummary["prices"];
  /** RENTAL lines: display price (INR minor units) and access length. */
  rentalPrice?: number;
  rentalDurationDays?: number;
  pageCount?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  selectedProductIds?: string[];
  selectedBooks?: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    prices?: ProductSummary["prices"];
  }[];
  bundleSize?: number;
  customBundleDiscountPercentage?: number;
  bundlePrices?: {
    quantity: number;
    currencyCode: string;
    price: number;
    compareAtPrice?: number;
    enabled: boolean;
  }[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (cartItemId: string) => void;
  setQuantity: (cartItemId: string, quantity: number) => void;
  clear: () => void;
}

function matchesCartItem(item: CartItem, cartItemId: string) {
  const itemId = item.cartItemId ?? item.productId;
  return (
    itemId === cartItemId ||
    (item.type === "RENTAL" && item.productId === cartItemId) ||
    (item.type === "UPGRADE" && item.productId === cartItemId)
  );
}

/** One cart line per variant: the same book in colour and in black &
 * white are separate lines, a rental is its own line. */
function lineKey(item: Pick<CartItem, "type" | "productId" | "cartItemId" | "format">) {
  if (item.type === "RENTAL") return `rental:${item.productId}`;
  if (item.type === "UPGRADE") return `upgrade:${item.productId}`;
  if (item.type === "CUSTOM_BUNDLE") return item.cartItemId ?? item.productId;
  return variantId(item.productId, item.format ?? "COLOUR_PDF");
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        const key = lineKey(item);
        const itemWithId = { ...item, cartItemId: item.cartItemId ?? key };
        const existing = get().items.find((i) => lineKey(i) === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              lineKey(i) === key ? { ...i, ...itemWithId, cartItemId: i.cartItemId ?? itemWithId.cartItemId } : i,
            ),
            isOpen: true,
          });
          return;
        }
        set({
          items: [...get().items, { ...itemWithId, quantity: 1 }],
          isOpen: true,
        });
      },
      removeItem: (cartItemId) =>
        set({
          items: get().items.filter(
            (item) => !matchesCartItem(item, cartItemId),
          ),
        }),
      setQuantity: (cartItemId, quantity) => {
        if (quantity < 1) {
          set({
            items: get().items.filter(
              (item) => !matchesCartItem(item, cartItemId),
            ),
          });
          return;
        }
        set({
          items: get().items.map((item) =>
            matchesCartItem(item, cartItemId) ? { ...item, quantity } : item,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "little-ilmies-cart" },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
