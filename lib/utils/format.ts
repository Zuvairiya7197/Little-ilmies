import { CURRENCIES, type CurrencyCode } from "@/types/pricing";

/** amount is in minor units (paise/cents/pence/fils). */
export function formatPrice(amount: number, currencyCode: CurrencyCode = "INR") {
  const currency = CURRENCIES[currencyCode];
  const major = amount / 100;
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: major % 1 === 0 ? 0 : 2,
  }).format(major);
}
