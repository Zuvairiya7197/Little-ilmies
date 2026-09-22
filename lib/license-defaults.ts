/**
 * Standard digital-product defaults for new products — shared between the
 * admin product form (client) and the create-product API route (server),
 * so a request that arrives with an empty author/license still gets the
 * same values the form would have shown. Never applied on update: existing
 * products keep whatever author/license they were saved with.
 */
export const DEFAULT_PRODUCT_AUTHOR = "Little Ilmies";

export const LICENSE_INFO_DEFAULTS = {
  PERSONAL_USE: "This eBook is for individual use only. It may not be shared, redistributed, or resold.",
  PERSONAL_CLASSROOM:
    "This eBook may be used for personal learning and teaching within the purchaser's own classroom or educational setting. It may be printed for the purchaser's own students but may not be shared digitally, redistributed, uploaded, resold, or provided to other teachers, schools, or organizations.",
  COMMERCIAL_USE:
    "This eBook may be used as part of the purchaser's own commercial educational activities or services. The original digital file may not be resold, redistributed, uploaded, or shared as a standalone product. Commercial use does not transfer copyright or ownership of the original content.",
} as const;

export type UsageLicense = keyof typeof LICENSE_INFO_DEFAULTS;

/** True if `value` is empty or still exactly matches one of the three
 * system-generated default texts — i.e. safe to overwrite when the admin
 * switches Usage License, as opposed to text they typed themselves. */
export function isLicenseInfoDefaultOrEmpty(value: string | undefined | null): boolean {
  if (!value || value.trim() === "") return true;
  return Object.values(LICENSE_INFO_DEFAULTS).includes(value as (typeof LICENSE_INFO_DEFAULTS)[UsageLicense]);
}
