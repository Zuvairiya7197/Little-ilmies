"use client";

import type { LucideIcon } from "lucide-react";
import { useShopFilters } from "@/hooks/use-shop-filters";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { formatPrice } from "@/lib/utils/format";
import { getCategoryIcon } from "@/lib/category-icons";
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

      <FilterGroup title="Category">
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
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

      <FilterGroup title="More">
        <div className="flex flex-col gap-1">
          <FilterCheckbox
            label="New arrivals"
            checked={isBooleanActive("new")}
            onChange={(checked) => {
              setBoolean("new", checked);
              onApply?.();
            }}
          />
          <FilterCheckbox
            label="Best sellers"
            checked={isBooleanActive("bestseller")}
            onChange={(checked) => {
              setBoolean("bestseller", checked);
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
      <span>{label}</span>
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
