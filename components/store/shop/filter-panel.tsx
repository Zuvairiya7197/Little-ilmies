"use client";

import { X, type LucideIcon } from "lucide-react";
import { useShopFilters } from "@/hooks/use-shop-filters";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { formatPrice } from "@/lib/utils/format";
import { getCategoryIcon } from "@/lib/category-icons";
import { getBooksMenuSections } from "@/lib/store-navigation";
import { activityTypes } from "@/lib/activity-types";
import type { CurrencyCode } from "@/types/pricing";
import type { AgeRange, Category, Language, ProductFormat } from "@/types/catalog";
import { cn } from "@/lib/utils/cn";

const ageRanges: AgeRange[] = ["0-3", "3-6", "6-9", "9-12", "12+"];
const languages: Language[] = ["English", "Arabic", "Hindi", "Marathi"];
const formats: ProductFormat[] = ["PDF", "Printable PDF", "Interactive PDF"];

// Manually tuned bucket boundaries per currency — these mirror the actual
// regional price points (not a currency conversion of the INR buckets).
const priceBucketBoundaries: Record<CurrencyCode, [number, number]> = {
  INR: [30000, 45000],
  USD: [40000, 45000],
  GBP: [35000, 40000],
  AED: [140000, 170000],
};

function getPriceBuckets(currency: CurrencyCode) {
  const [low, high] = priceBucketBoundaries[currency];
  const fmt = (minorUnits: number) => formatPrice(minorUnits, currency);
  return [
    { label: `Under ${fmt(low)}`, min: undefined, max: low },
    { label: `${fmt(low)} – ${fmt(high)}`, min: low, max: high },
    { label: `Above ${fmt(high)}`, min: high, max: undefined },
  ];
}

export function FilterPanel({
  categories,
  onApply,
  showHeading = true,
}: {
  categories: Category[];
  onApply?: () => void;
  showHeading?: boolean;
}) {
  const {
    isArrayValueActive,
    toggleArrayValue,
    isBooleanActive,
    setBoolean,
    setPriceRange,
    filters,
    clearAll,
    activeFilterCount,
  } = useShopFilters();
  const currency = useCurrencyStore((s) => s.currency);
  const priceBuckets = getPriceBuckets(currency);
  const categoryGroups = buildFilterCategoryGroups(categories);

  const isPriceBucketActive = (min?: number, max?: number) =>
    filters.minPrice === min && filters.maxPrice === max;

  return (
    <div className="flex flex-col gap-7">
      {showHeading && (
        <div className="flex items-center justify-between border-b border-ink-100 pb-4">
          <h2 className="font-display text-xl font-bold text-ink-700">Filters</h2>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-semibold text-ink-500 underline-offset-2 hover:text-ink-700 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <ActiveFilterChips categories={categories} />

      <FilterGroup title="Category">
        <div className="flex flex-col gap-4">
          {categoryGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-ink-300">
                {group.title}
              </p>
              <div className="flex flex-col gap-1">
                {group.categories.map((cat) => (
                  <FilterCheckbox
                    key={cat.slug}
                    label={cat.name}
                    icon={getCategoryIcon(cat.slug)}
                    checked={isArrayValueActive("category", cat.slug)}
                    onChange={() => {
                      toggleArrayValue("category", cat.slug);
                      onApply?.();
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Age range">
        <div className="flex flex-wrap gap-2">
          {ageRanges.map((age) => (
            <FilterChip
              key={age}
              label={age}
              checked={isArrayValueActive("age", age)}
              onChange={() => {
                toggleArrayValue("age", age);
                onApply?.();
              }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Activity Type">
        <div className="flex flex-wrap gap-2">
          {activityTypes.map((type) => (
            <FilterChip
              key={type}
              label={type}
              checked={isArrayValueActive("activity", type)}
              onChange={() => {
                toggleArrayValue("activity", type);
                onApply?.();
              }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex flex-col gap-1">
          {priceBuckets.map((bucket) => (
            <FilterCheckbox
              key={bucket.label}
              label={bucket.label}
              checked={isPriceBucketActive(bucket.min, bucket.max)}
              onChange={() => {
                if (isPriceBucketActive(bucket.min, bucket.max)) {
                  setPriceRange(undefined, undefined);
                } else {
                  setPriceRange(bucket.min, bucket.max);
                }
                onApply?.();
              }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Language">
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <FilterChip
              key={lang}
              label={lang}
              checked={isArrayValueActive("language", lang)}
              onChange={() => {
                toggleArrayValue("language", lang);
                onApply?.();
              }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Format">
        <div className="flex flex-col gap-1">
          {formats.map((format) => (
            <FilterCheckbox
              key={format}
              label={format}
              checked={isArrayValueActive("format", format)}
              onChange={() => {
                toggleArrayValue("format", format);
                onApply?.();
              }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Special">
        <div className="flex flex-col gap-1">
          <FilterCheckbox
            label="New arrival"
            checked={isBooleanActive("new")}
            onChange={(checked) => {
              setBoolean("new", checked);
              onApply?.();
            }}
          />
          <FilterCheckbox
            label="Bestseller"
            checked={isBooleanActive("bestseller")}
            onChange={(checked) => {
              setBoolean("bestseller", checked);
              onApply?.();
            }}
          />
          <FilterCheckbox
            label="Featured"
            checked={isBooleanActive("featured")}
            onChange={(checked) => {
              setBoolean("featured", checked);
              onApply?.();
            }}
          />
          <FilterCheckbox
            label="On sale"
            checked={isBooleanActive("sale")}
            onChange={(checked) => {
              setBoolean("sale", checked);
              onApply?.();
            }}
          />
          <FilterCheckbox
            label="Free preview available"
            checked={isBooleanActive("preview")}
            onChange={(checked) => {
              setBoolean("preview", checked);
              onApply?.();
            }}
          />
        </div>
      </FilterGroup>
    </div>
  );
}

const BOOLEAN_CHIP_LABELS: Record<"new" | "bestseller" | "featured" | "sale" | "preview", string> = {
  new: "New arrival",
  bestseller: "Bestseller",
  featured: "Featured",
  sale: "On sale",
  preview: "Free preview",
};

/**
 * Removable chips summarizing every active filter, mirroring the pattern
 * described in the storefront filter spec: one chip per selected value
 * (not per group), each removable on its own without disturbing the rest.
 * Reads straight from useShopFilters()/searchParams — no separate state,
 * so it can never drift from the filters actually applied.
 */
function ActiveFilterChips({ categories }: { categories: Category[] }) {
  const { filters, toggleArrayValue, setBoolean, clearPriceRange, clearAll, activeFilterCount } = useShopFilters();
  const currency = useCurrencyStore((s) => s.currency);

  if (activeFilterCount === 0) return null;

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.name]));

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  for (const slug of filters.categorySlugs ?? []) {
    chips.push({
      key: `category:${slug}`,
      label: categoryBySlug.get(slug) ?? slug,
      onRemove: () => toggleArrayValue("category", slug),
    });
  }
  for (const age of filters.ageRanges ?? []) {
    chips.push({ key: `age:${age}`, label: `Age ${age}`, onRemove: () => toggleArrayValue("age", age) });
  }
  for (const type of filters.activityTypes ?? []) {
    chips.push({ key: `activity:${type}`, label: type, onRemove: () => toggleArrayValue("activity", type) });
  }
  for (const lang of filters.languages ?? []) {
    chips.push({ key: `language:${lang}`, label: lang, onRemove: () => toggleArrayValue("language", lang) });
  }
  for (const format of filters.formats ?? []) {
    chips.push({ key: `format:${format}`, label: format, onRemove: () => toggleArrayValue("format", format) });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const { min, max } = { min: filters.minPrice, max: filters.maxPrice };
    const label =
      min !== undefined && max !== undefined
        ? `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`
        : min !== undefined
          ? `Above ${formatPrice(min, currency)}`
          : `Under ${formatPrice(max!, currency)}`;
    chips.push({ key: "price", label, onRemove: clearPriceRange });
  }
  if (filters.newArrivalsOnly) chips.push({ key: "new", label: BOOLEAN_CHIP_LABELS.new, onRemove: () => setBoolean("new", false) });
  if (filters.bestsellersOnly) chips.push({ key: "bestseller", label: BOOLEAN_CHIP_LABELS.bestseller, onRemove: () => setBoolean("bestseller", false) });
  if (filters.featuredOnly) chips.push({ key: "featured", label: BOOLEAN_CHIP_LABELS.featured, onRemove: () => setBoolean("featured", false) });
  if (filters.onSaleOnly) chips.push({ key: "sale", label: BOOLEAN_CHIP_LABELS.sale, onRemove: () => setBoolean("sale", false) });
  if (filters.freePreviewOnly) chips.push({ key: "preview", label: BOOLEAN_CHIP_LABELS.preview, onRemove: () => setBoolean("preview", false) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 pb-4">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="tap-target inline-flex items-center gap-1.5 rounded-full bg-sage-50 py-1.5 pl-3 pr-2 text-xs font-semibold text-sage-700 transition-colors hover:bg-gold-50 hover:text-gold-700"
        >
          <span className="max-w-[10rem] truncate xs:max-w-[14rem]">{chip.label}</span>
          <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="tap-target text-xs font-semibold text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function buildFilterCategoryGroups(categories: Category[]): { title: string; categories: Category[] }[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  return getBooksMenuSections(categories)
    .filter((section) => section.title !== "Shop by Age")
    .map((section) => {
      const categorySlugs = section.links
        .map((link) => slugFromHref(link.href))
        .filter((slug): slug is string => Boolean(slug));
      const groupCategories = categorySlugs
        .map((slug) => bySlug.get(slug))
        .filter((category): category is Category => Boolean(category));
      return { title: section.title, categories: groupCategories };
    })
    .filter((group) => group.categories.length > 0);
}

function slugFromHref(href: string) {
  const match = href.match(/^\/shop\/([^?/#]+)/);
  return match?.[1];
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="section-eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: LucideIcon;
}) {
  return (
    <label className="tap-target flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-ink-500 hover:bg-cream-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-ink-200 text-sage-600 focus:ring-sage-400"
      />
      {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />}
      <span className="min-w-0 break-words">{label}</span>
    </label>
  );
}

function FilterChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={cn(
        "tap-target rounded-full border-0 px-4 py-2 text-sm font-medium transition-all duration-200",
        checked
          ? "bg-sage-500 text-cream-50 shadow-clay-pressed"
          : "bg-cream-100 text-ink-500 shadow-clay-sm hover:text-ink-700"
      )}
    >
      {label}
    </button>
  );
}
