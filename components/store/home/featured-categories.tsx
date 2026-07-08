import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";

export function FeaturedCategories() {
  return (
    <section aria-labelledby="categories-heading" className="py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="mb-6 flex items-end justify-between gap-4 xs:mb-8">
          <div>
            <p className="section-eyebrow">Browse by category</p>
            <h2 id="categories-heading" className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
              Find the right book for your child
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline md:block"
          >
            View all
          </Link>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5">
          {categories.map((cat) => (
            <li
              key={cat.slug}
              className="w-[42vw] shrink-0 snap-start xs:w-[34vw] sm:w-[28vw] md:w-auto"
            >
              <Link href={`/shop/${cat.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream-200 shadow-soft">
                  <Image
                    src={cat.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 40vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-700/60 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-xs font-semibold text-cream-50 xs:text-sm">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-cream-200">
                      {cat.bookCount} books
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/shop"
            className="text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
          >
            View all categories
          </Link>
        </div>
      </div>
    </section>
  );
}
