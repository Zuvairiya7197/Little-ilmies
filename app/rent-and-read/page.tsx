import type { Metadata } from "next";
import Image from "@/components/ui/app-image";
import Link from "next/link";
import { BookOpen, Clock, ShoppingBag } from "lucide-react";
import { getRentAndReadProducts } from "@/lib/db/catalog";
import { RentalEligibleGate } from "@/components/store/rental-eligible-gate";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { productHref } from "@/lib/formats";
import { formatPrice } from "@/lib/utils/format";

// Hourly, not daily like the rest of the site: prices here are resolved on
// the server, so a scheduled sale has to start and end close to on time.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Rent & Read",
  description:
    "Read selected Little Ilmies books online for 7 days with Rent & Read.",
  alternates: { canonical: "/rent-and-read" },
};

export default async function RentAndReadPage() {
  const rentableProducts = await getRentAndReadProducts();
  // Only books whose Rent & Read format is actually purchasable.
  const products = rentableProducts.flatMap((product) => {
    const rental = product.variants.find((variant) => variant.format === "RENT_AND_READ");
    return rental?.rentalPrice != null ? [{ product, rental, rentalPrice: rental.rentalPrice }] : [];
  });

  return (
    <div className="container-content py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <p className="section-eyebrow text-sage-700">Rent &amp; Read</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
          Read selected Little Ilmies books online for 7 days.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
          Not ready to buy? Start with temporary online access, then buy the
          full PDF whenever you are ready.
        </p>
      </div>

      <RentalEligibleGate
        fallback={
          <section className="rounded-3xl bg-cream-50 p-8 text-center shadow-clay-sm">
            <h2 className="font-display text-2xl font-bold text-ink-700">
              Rent &amp; Read is available in India
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
              You can still browse and buy downloadable Little Ilmies ebooks.
            </p>
            <Link href="/shop" className="btn-primary mt-6">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Browse Books
            </Link>
          </section>
        }
      >
        {products.length === 0 ? (
        <section className="rounded-3xl bg-cream-50 p-8 text-center shadow-clay-sm">
          <h2 className="font-display text-2xl font-bold text-ink-700">
            No Rent &amp; Read books yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            Please check back soon for eligible books.
          </p>
        </section>
        ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {products.map(({ product, rental, rentalPrice }) => {
            const pdfVariant = product.variants.find((variant) => variant.format !== "RENT_AND_READ");
            let price: ReturnType<typeof resolveProductPrice> | null = null;
            try {
              price = pdfVariant ? resolveProductPrice(pdfVariant, "INR") : null;
            } catch {
              price = null;
            }
            const salePrice = price ? (price.salePrice ?? price.regularPrice) : null;

            return (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-cream-50 shadow-clay transition-transform duration-300 hover:-translate-y-1"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="relative block aspect-[3/4] bg-cream-100 p-4 xs:p-5 lg:aspect-[4/3] lg:p-4"
                >
                  <Image
                    src={product.coverImage}
                    alt={`${product.title} cover`}
                    fill
                    sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                    className="object-contain p-4 xs:p-5 lg:p-4"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h2 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold leading-snug text-ink-700">
                    <Link href={`/product/${product.slug}`}>
                      {product.title}
                    </Link>
                  </h2>
                  {price && salePrice != null && (
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-semibold text-ink-400">
                        Buy
                      </span>
                      <span className="font-display text-base font-semibold text-ink-700">
                        {formatPrice(salePrice, price.currencyCode)}
                      </span>
                      {price.regularPrice > salePrice && (
                        <span className="text-sm text-ink-300 line-through">
                          {formatPrice(price.regularPrice, price.currencyCode)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 rounded-xl bg-sage-50 p-2.5 sm:p-3">
                    <p className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-sage-800">
                        Rent &amp; Read
                      </span>
                      <span className="font-display text-base font-bold text-sage-800">
                        {formatPrice(rentalPrice, "INR")}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {rental.rentalDurationDays ?? 7} days online reading
                    </p>
                  </div>
                  <Link
                    href={productHref(product.slug, "RENT_AND_READ")}
                    className="btn-primary mt-3 justify-center px-3 py-2 text-sm"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Rent &amp; Read
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
        )}
      </RentalEligibleGate>
    </div>
  );
}
