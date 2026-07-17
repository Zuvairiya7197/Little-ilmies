import { FilterPanel } from "@/components/store/shop/filter-panel";
import type { Category } from "@/types/catalog";

export function FilterSidebar({ categories }: { categories: Category[] }) {
  return (
    <aside className="hidden w-72 shrink-0 md:block">
      <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl bg-cream-50 p-5 shadow-clay">
        <FilterPanel categories={categories} />
      </div>
    </aside>
  );
}
