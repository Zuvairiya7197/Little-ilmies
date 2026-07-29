import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@/types/catalog";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  coverImage: string;
  prices?: ProductSummary["prices"];
  ageRange?: ProductSummary["ageRange"];
  pageCount?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map((i) => (i.productId === item.productId ? { ...i, ...item } : i)),
            isOpen: true,
          });
          return;
        }
        set({ items: [...get().items, { ...item, quantity: 1 }], isOpen: true });
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      setQuantity: (productId, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "little-ilmies-cart" }
  )
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
