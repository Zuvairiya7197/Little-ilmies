import { ProductCard } from "@/components/store/product-card";
import type { ProductSummary } from "@/types/catalog";

/**
 * What cached shop pages send as HTML. ShopView reads the URL's filters, so
 * it can only render in the browser; this gives search engines and first
 * paint the real heading and product links until it takes over.
 */
export function ShopFallback({
  products,
  title,
  description,
}: {
  products: ProductSummary[];
  title: string;
  description?: string;
}) {
  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <div className="mb-6 xs:mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-700 xs:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm text-ink-400 xs:text-base">{description}</p>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} tintIndex={index} />
        ))}
      </div>
    </div>
  );
}
