import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FALLBACK_CURRENCY, type CurrencyCode } from "@/types/pricing";
import { currencyFromCountryCode, detectInitialCurrency } from "@/lib/pricing/detect-currency";

interface CurrencyState {
  /**
   * The currency shown to this customer, resolved automatically from IP/
   * locale detection. There is no customer-facing control to change this —
   * pricing region is backend/detection-controlled, not a shopper choice.
   * (See README "Regional pricing": the real checkout backend re-verifies
   * region server-side from IP → billing country → payment method country
   * → verified account country and recomputes the charge independently of
   * whatever this store shows.)
   */
  currency: CurrencyCode;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  /**
   * Called once a real checkout exists, after the backend has verified the
   * billing region for the order. If it differs from the browsing-region
   * currency above, the UI should show the one quiet mismatch message the
   * spec allows ("Your checkout region is different from your browsing
   * region, so the price has been updated.") — never a persistent notice
   * when regions already agree.
   */
  checkoutCurrency: CurrencyCode | null;
  setCheckoutCurrency: (currency: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: FALLBACK_CURRENCY,
      hasHydrated: false,
      checkoutCurrency: null,

      hydrate: async () => {
        if (get().hasHydrated) return;
        set({ hasHydrated: true });

        const cookieCountry =
          typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("li_detected_country="))
                ?.split("=")[1]
            : undefined;

        const detected = cookieCountry
          ? currencyFromCountryCode(cookieCountry)
          : await detectInitialCurrency();

        set({ currency: detected });
      },

      setCheckoutCurrency: (currency) => set({ checkoutCurrency: currency }),
    }),
    {
      name: "little-ilmies-currency",
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);

export function selectHasRegionMismatch(state: CurrencyState) {
  return state.checkoutCurrency !== null && state.checkoutCurrency !== state.currency;
}
