import { COUNTRY_TO_CURRENCY, FALLBACK_CURRENCY, type CurrencyCode } from "@/types/pricing";

export function currencyFromCountryCode(countryCode: string | null | undefined): CurrencyCode {
  if (!countryCode) return FALLBACK_CURRENCY;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? FALLBACK_CURRENCY;
}

/**
 * Browser-locale fallback for when we have no IP/country signal at all
 * (e.g. geolocation lookup failed and there's no server-set header yet).
 * This reads the locale's region subtag, NOT the language — "en-GB" maps
 * to GB, "ar-AE" maps to AE, etc. Never used for price math, only routing
 * to the right manually-curated regional price.
 */
export function currencyFromBrowserLocale(): CurrencyCode {
  if (typeof navigator === "undefined") return FALLBACK_CURRENCY;

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const locale of locales) {
    const region = new Intl.Locale(locale).maximize().region;
    if (region) {
      const currency = currencyFromCountryCode(region);
      if (currency !== FALLBACK_CURRENCY || region === "US") return currency;
    }
  }

  return FALLBACK_CURRENCY;
}

/**
 * Client-side best-effort IP geolocation for local development and any
 * environment without edge geolocation headers. In production behind
 * Vercel/Cloudflare, prefer the `x-vercel-ip-country` / `cf-ipcountry`
 * request header set in middleware.ts instead — this fetch is the fallback
 * for local dev and platforms without that header.
 */
export async function detectCountryFromIp(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.country_code === "string" ? data.country_code : null;
  } catch {
    return null;
  }
}

export async function detectInitialCurrency(): Promise<CurrencyCode> {
  const country = await detectCountryFromIp();
  if (country) return currencyFromCountryCode(country);
  return currencyFromBrowserLocale();
}
