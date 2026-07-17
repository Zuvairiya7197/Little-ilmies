import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import type { AgeRange } from "@/types/catalog";

const ageBands: { range: AgeRange; label: string; tint: string; image?: string }[] = [
  { range: "0-3", label: "0–3 Years", tint: "bg-ink-600", image: "/images/age-0-3.png" },
  { range: "3-6", label: "3–6 Years", tint: "bg-sunny-500", image: "/images/age-3-6.png" },
  { range: "6-9", label: "6–9 Years", tint: "bg-lemon-600", image: "/images/age-6-9.png" },
  { range: "9-12", label: "9–12 Years", tint: "bg-teal-500", image: "/images/age-9-12.png" },
  { range: "12+", label: "12+ Years", tint: "bg-blossom-500", image: "/images/age-12-plus.png" },
];

export function ShopByAge() {
  return (
    <section aria-labelledby="shop-by-age-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="mx-auto mb-8 max-w-xl text-center xs:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sage-600 shadow-clay-sm">
            <ShoppingBag className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
            Shop by Age
          </span>
          <h2 id="shop-by-age-heading" className="mt-3 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
            Books for every age &amp; stage
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
            Find the perfect books and activities designed for your
            child&apos;s learning journey.
          </p>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar xs:-mx-5 xs:px-5 xs:gap-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {ageBands.map(({ range, label, tint, image }) => (
            <li key={range} className="w-36 shrink-0 snap-start xs:w-44 sm:w-auto">
              <Link
                href={`/shop?age=${encodeURIComponent(range)}`}
                className={`tap-target group flex h-64 flex-col items-center rounded-3xl px-4 pb-4 pt-5 text-cream-50 shadow-clay transition-transform duration-200 hover:-translate-y-1 xs:h-80 ${tint}`}
              >
                <span className="text-center">
                  <span className="block font-display text-2xl font-bold leading-none xs:text-3xl">{range}</span>
                  <span className="mt-1.5 block text-sm font-semibold opacity-90 xs:text-base">
                    {label.split(" ").slice(-1)[0]}
                  </span>
                </span>

                {image ? (
                  <div className="relative mt-2 w-full flex-1">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(max-width: 480px) 144px, 220px"
                      className="object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <span className="flex-1" aria-hidden="true" />
                )}

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 text-ink-600 shadow-soft transition-transform group-hover:translate-x-0.5 xs:h-10 xs:w-10">
                  <ArrowRight className="h-4 w-4 xs:h-5 xs:w-5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
