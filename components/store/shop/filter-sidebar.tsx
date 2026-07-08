import { FilterPanel } from "@/components/store/shop/filter-panel";

export function FilterSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <FilterPanel />
      </div>
    </aside>
  );
}
