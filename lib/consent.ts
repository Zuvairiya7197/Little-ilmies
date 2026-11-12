/**
 * The visitor's choice about advertising cookies (the Meta Pixel). Kept in
 * this browser only; "unset" until they answer the banner. UK GDPR/PECR and
 * India's DPDP Act need the choice before non-essential tracking runs.
 */
export type AdConsent = "accepted" | "declined" | "unset";

const STORAGE_KEY = "little-ilmies:ad-consent";
const CHANGE_EVENT = "little-ilmies:ad-consent-change";
/** Fired by "Cookie settings" to show the banner again. */
export const REOPEN_CONSENT_EVENT = "little-ilmies:ad-consent-reopen";

export function readAdConsent(): AdConsent {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : "unset";
  } catch {
    return "unset";
  }
}

export function saveAdConsent(consent: Exclude<AdConsent, "unset">) {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Calls back with the current choice now and whenever it changes. */
export function subscribeAdConsent(callback: (consent: AdConsent) => void) {
  const handler = () => callback(readAdConsent());
  handler();
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
