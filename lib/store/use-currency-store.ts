import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FALLBACK_CURRENCY, type CurrencyCode } from "@/types/pricing";
import { currencyFromCountryCode, detectInitialCurrency } from "@/lib/pricing/detect-currency";

interface CurrencyState {
  currency: CurrencyCode;
  /** True once the customer has explicitly picked a currency — stops auto-detection from overriding it. */
  isManuallySet: boolean;
  hasHydratedFromDetection: boolean;
  setCurrency: (currency: CurrencyCode, manual?: boolean) => void;
  hydrateFromDetection: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: FALLBACK_CURRENCY,
      isManuallySet: false,
      hasHydratedFromDetection: false,

      setCurrency: (currency, manual = true) =>
        set({ currency, isManuallySet: manual || get().isManuallySet }),

      hydrateFromDetection: async () => {
        if (get().hasHydratedFromDetection || get().isManuallySet) return;
        set({ hasHydratedFromDetection: true });

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

        if (!get().isManuallySet) {
          set({ currency: detected });
        }
      },
    }),
    {
      name: "little-ilmies-currency",
      partialize: (state) => ({
        currency: state.currency,
        isManuallySet: state.isManuallySet,
      }),
    }
  )
);
