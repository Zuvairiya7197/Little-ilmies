export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <div className="aspect-[3/4] animate-pulse rounded-2xl bg-cream-200" />
      <div className="mt-3 flex flex-col gap-2">
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-cream-200" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-cream-200" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-cream-200" />
        <div className="mt-1 h-6 w-1/2 animate-pulse rounded-full bg-cream-200" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4"
      role="status"
      aria-label="Loading books"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
