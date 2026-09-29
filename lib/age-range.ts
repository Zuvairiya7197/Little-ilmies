/**
 * Product age ranges are stored as numeric fields on Product — ageFrom,
 * ageTo (nullable ints, both null = no age recommendation) and ageOpenEnded
 * (true = "ageFrom+", with ageTo pinned to AGE_MAX). Display strings like
 * "4–7 years" are always derived here, never stored.
 *
 * The storefront "Shop by Age" bands (0–3, 3–6, …, 12+) are FILTER GROUPS,
 * not product values: a 4–7 book shows under both 3–6 and 6–9.
 */

export const AGE_MIN = 0;
/** Highest selectable age; shown as "18+" and always paired with ageOpenEnded. */
export const AGE_MAX = 18;

export const AGE_OPTIONS = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);

export interface ProductAgeRange {
  ageFrom: number | null;
  ageTo: number | null;
  ageOpenEnded: boolean;
}

/** Single-age chips in the shop filter panel ("Age 3" … "Age 12"). */
export const AGE_FILTER_OPTIONS = Array.from({ length: 10 }, (_, i) => 3 + i);

export const AGE_GROUPS = ["0-3", "3-6", "6-9", "9-12", "12+"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

/** Half-open [min, max) bounds per filter group; max null = no upper bound. */
const AGE_GROUP_BOUNDS: Record<AgeGroup, { min: number; max: number | null }> = {
  "0-3": { min: 0, max: 3 },
  "3-6": { min: 3, max: 6 },
  "6-9": { min: 6, max: 9 },
  "9-12": { min: 9, max: 12 },
  "12+": { min: 12, max: null },
};

/** Legacy /shop/<slug> age category pages → filter group. */
export const AGE_CATEGORY_TO_GROUP: Record<string, AgeGroup> = {
  "0-3-years": "0-3",
  "3-6-years": "3-6",
  "6-9-years": "6-9",
  "9-12-years": "9-12",
  "12-plus-years": "12+",
};

export function isAgeGroup(value: string): value is AgeGroup {
  return (AGE_GROUPS as readonly string[]).includes(value);
}

export function formatAgeGroup(group: AgeGroup) {
  return group.replace(/-/g, "–");
}

export function formatAgeOption(age: number) {
  if (age >= AGE_MAX) return `${AGE_MAX}+ years`;
  return `${age} ${age === 1 ? "year" : "years"}`;
}

function hasAgeRange(range: ProductAgeRange): range is { ageFrom: number; ageTo: number; ageOpenEnded: boolean } {
  return range.ageFrom != null && range.ageTo != null;
}

/** "4–7", "5", "12+" — or null when the product has no age range. */
export function formatAgeRangeShort(range: ProductAgeRange): string | null {
  if (!hasAgeRange(range)) return null;
  if (range.ageOpenEnded) return `${range.ageFrom}+`;
  if (range.ageFrom === range.ageTo) return `${range.ageFrom}`;
  return `${range.ageFrom}–${range.ageTo}`;
}

/** "4–7 years", "5 years", "1 year", "12+ years" — or null when not specified. */
export function formatAgeRange(range: ProductAgeRange): string | null {
  const short = formatAgeRangeShort(range);
  if (short == null) return null;
  const singular = !range.ageOpenEnded && range.ageFrom === 1 && range.ageTo === 1;
  return `${short} ${singular ? "year" : "years"}`;
}

/** A child of exactly `age` — ageFrom <= age AND (ageTo >= age OR open-ended). */
export function productMatchesAge(range: ProductAgeRange, age: number) {
  if (!hasAgeRange(range)) return false;
  return range.ageFrom <= age && (range.ageOpenEnded || range.ageTo >= age);
}

/**
 * Whether a product's range meaningfully overlaps a filter group. Both are
 * treated as half-open spans so shared boundaries don't leak: a 3–6 book
 * belongs to the 3–6 group only (not 0–3 or 6–9), while 4–7 overlaps both
 * 3–6 and 6–9. A single-age product (5–5) spans [5, 6).
 */
export function productMatchesAgeGroup(range: ProductAgeRange, group: AgeGroup) {
  if (!hasAgeRange(range)) return false;
  const bounds = AGE_GROUP_BOUNDS[group];
  const productEnd = range.ageOpenEnded ? Infinity : Math.max(range.ageTo, range.ageFrom + 1);
  const groupEnd = bounds.max ?? Infinity;
  return range.ageFrom < groupEnd && productEnd > bounds.min;
}

/**
 * Canonical DB values from form input: no range → all null/false;
 * open-ended or "18+" as the upper bound → ageTo = AGE_MAX, ageOpenEnded.
 */
export function normalizeAgeRange(input: {
  hasAgeRange: boolean;
  ageFrom: number | null;
  ageTo: number | null;
  ageOpenEnded: boolean;
}): ProductAgeRange {
  if (!input.hasAgeRange || input.ageFrom == null) {
    return { ageFrom: null, ageTo: null, ageOpenEnded: false };
  }
  const openEnded = input.ageOpenEnded || input.ageTo === AGE_MAX;
  return {
    ageFrom: input.ageFrom,
    ageTo: openEnded ? AGE_MAX : input.ageTo,
    ageOpenEnded: openEnded,
  };
}
