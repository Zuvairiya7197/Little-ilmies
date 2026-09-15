import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, ShoppingBag } from "lucide-react";
import { getRentAndReadProducts } from "@/lib/db/catalog";
import { isRentalEligibleFromHeaders } from "@/lib/rentals/eligibility";
import { calculateRentalPrice } from "@/lib/rentals/pricing";
import { resolveProductPrice } from "@/lib/pricing/resolve-price";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Rent & Read",
  description: "Read selected Little Ilmies books online for 7 days with Rent & Read.",
  alternates: { canonical: "/rent-and-read" },
};

export default async function RentAndReadPage() {
  const [eligible, products] = await Promise.all([
    isRentalEligibleFromHeaders(),
    getRentAndReadProducts(),
  ]);

  return (
    <div className="container-content py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <p className="section-eyebrow text-sage-700">Rent &amp; Read</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-700 xs:text-4xl">
          Read selected Little Ilmies books online for 7 days.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
          Not ready to buy? Start with temporary online access, then buy the full PDF whenever you are ready.
        </p>
      </div>

      {!eligible ? (
        <section className="rounded-3xl bg-cream-50 p-8 text-center shadow-clay-sm">
          <h2 className="font-display text-2xl font-bold text-ink-700">Rent &amp; Read is available in India</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            You can still browse and buy downloadable Little Ilmies ebooks.
          </p>
          <Link href="/shop" className="btn-primary mt-6">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Browse Books
          </Link>
        </section>
      ) : products.length === 0 ? (
        <section className="rounded-3xl bg-cream-50 p-8 text-center shadow-clay-sm">
          <h2 className="font-display text-2xl font-bold text-ink-700">No Rent &amp; Read books yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            Please check back soon for eligible books.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const price = resolveProductPrice(product, "INR");
            const salePrice = price.salePrice ?? price.regularPrice;
            const rentalPrice = calculateRentalPrice(salePrice);

            return (
              <article key={product.id} className="flex flex-col overflow-hidden rounded-3xl bg-cream-50 shadow-clay-sm">
                <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] bg-cream-100 p-7">
                  <Image src={product.coverImage} alt={`${product.title} cover`} fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-contain p-7" />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug text-ink-700">
                    <Link href={`/product/${product.slug}`}>{product.title}</Link>
                  </h2>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold text-ink-400">Buy</span>
                    <span className="font-display text-lg font-semibold text-ink-700">
                      {formatPrice(salePrice, "INR")}
                    </span>
                    {price.regularPrice > salePrice && (
                      <span className="text-sm text-ink-300 line-through">{formatPrice(price.regularPrice, "INR")}</span>
                    )}
                  </div>
                  <div className="mt-3 rounded-2xl bg-sage-50 p-3">
                    <p className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-sage-800">Rent &amp; Read</span>
                      <span className="font-display text-lg font-bold text-sage-800">{formatPrice(rentalPrice, "INR")}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      7 days online reading
                    </p>
                  </div>
                  <Link href={`/product/${product.slug}`} className="btn-primary mt-4 justify-center">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Rent &amp; Read
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
