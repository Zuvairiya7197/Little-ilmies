import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@/types/catalog";

export interface CartItem {
  cartItemId?: string;
  type?: "PRODUCT" | "CUSTOM_BUNDLE" | "RENTAL";
  productId: string;
  bundleId?: string;
  slug: string;
  title: string;
  coverImage: string;
  prices?: ProductSummary["prices"];
  ageRange?: ProductSummary["ageRange"];
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
    (item.type === "RENTAL" && item.productId === cartItemId)
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        const itemWithId = {
          ...item,
          cartItemId:
            item.cartItemId ??
            (item.type === "RENTAL"
              ? `rental:${item.productId}`
              : item.productId),
        };
        const existing = get().items.find(
          (i) => (i.cartItemId ?? i.productId) === itemWithId.cartItemId,
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              (i.cartItemId ?? i.productId) === itemWithId.cartItemId
                ? { ...i, ...itemWithId }
                : i,
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
