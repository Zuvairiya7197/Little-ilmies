"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AgeRange, Language, ProductFilters, ProductFormat, SortOption } from "@/types/catalog";

const ARRAY_KEYS = ["category", "age", "language", "format"] as const;
const BOOLEAN_KEYS = ["new", "bestseller", "sale", "preview"] as const;

export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ProductFilters = useMemo(() => {
    const categorySlugs = searchParams.getAll("category");
    const ageRanges = searchParams.getAll("age") as AgeRange[];
    const languages = searchParams.getAll("language") as Language[];
    const formats = searchParams.getAll("format") as ProductFormat[];
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const query = searchParams.get("q") ?? undefined;

    return {
      categorySlugs: categorySlugs.length ? categorySlugs : undefined,
      ageRanges: ageRanges.length ? ageRanges : undefined,
      languages: languages.length ? languages : undefined,
      formats: formats.length ? formats : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      newArrivalsOnly: searchParams.get("new") === "1",
      bestsellersOnly: searchParams.get("bestseller") === "1",
      onSaleOnly: searchParams.get("sale") === "1",
      freePreviewOnly: searchParams.get("preview") === "1",
      query,
    };
  }, [searchParams]);

  const sort = (searchParams.get("sort") as SortOption) || "featured";

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const key of ARRAY_KEYS) count += searchParams.getAll(key).length;
    for (const key of BOOLEAN_KEYS) if (searchParams.get(key) === "1") count += 1;
    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) count += 1;
    return count;
  }, [searchParams]);

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.push(`${pathname}?${params.toString()}` as never, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleArrayValue = useCallback(
    (key: (typeof ARRAY_KEYS)[number], value: string) => {
      updateParams((params) => {
        const values = params.getAll(key);
        params.delete(key);
        if (values.includes(value)) {
          values.filter((v) => v !== value).forEach((v) => params.append(key, v));
        } else {
          [...values, value].forEach((v) => params.append(key, v));
        }
      });
    },
    [updateParams]
  );

  const setBoolean = useCallback(
    (key: (typeof BOOLEAN_KEYS)[number], value: boolean) => {
      updateParams((params) => {
        if (value) params.set(key, "1");
        else params.delete(key);
      });
    },
    [updateParams]
  );

  const setPriceRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      updateParams((params) => {
        if (min !== undefined) params.set("minPrice", String(min));
        else params.delete("minPrice");
        if (max !== undefined) params.set("maxPrice", String(max));
        else params.delete("maxPrice");
      });
    },
    [updateParams]
  );

  const setSort = useCallback(
    (value: SortOption) => {
      updateParams((params) => {
        if (value === "featured") params.delete("sort");
        else params.set("sort", value);
      });
    },
    [updateParams]
  );

  const setQuery = useCallback(
    (value: string) => {
      updateParams((params) => {
        if (value) params.set("q", value);
        else params.delete("q");
      });
    },
    [updateParams]
  );

  const clearAll = useCallback(() => {
    const q = searchParams.get("q");
    const sortValue = searchParams.get("sort");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sortValue) params.set("sort", sortValue);
    router.push(`${pathname}?${params.toString()}` as never, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    filters,
    sort,
    activeFilterCount,
    toggleArrayValue,
    setBoolean,
    setPriceRange,
    setSort,
    setQuery,
    clearAll,
    isArrayValueActive: (key: (typeof ARRAY_KEYS)[number], value: string) =>
      searchParams.getAll(key).includes(value),
    isBooleanActive: (key: (typeof BOOLEAN_KEYS)[number]) => searchParams.get(key) === "1",
  };
}
