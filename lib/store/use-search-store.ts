import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

/** Lets components outside the header (sticky search bar, mobile bottom nav)
 * open the same global SearchOverlay the header mounts. */
export const useSearchStore = create<SearchState>()((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
}));
