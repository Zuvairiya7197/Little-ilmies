import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Download } from "lucide-react";

export function RentAndReadHighlight() {
  return (
    <section aria-labelledby="rent-read-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="overflow-hidden rounded-3xl bg-sage-50 p-6 shadow-clay-sm md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.7fr)] md:items-center md:gap-8 md:p-8">
          <div>
            <p className="section-eyebrow text-sage-700">Rent &amp; Read</p>
            <h2 id="rent-read-heading" className="mt-2 max-w-xl font-display text-2xl font-semibold leading-tight text-ink-700 xs:text-3xl">
              Not ready to buy? Read it first.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500 xs:text-base">
              Enjoy selected Little Ilmies books online for 7 days, starting from just ₹20.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-sage-700">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3 py-1.5">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Read online
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                7 days access
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3 py-1.5">
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                No PDF download
              </span>
            </div>
            <Link href="/rent-and-read" className="btn-primary mt-6">
              Explore Rent &amp; Read
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mx-auto mt-6 aspect-[4/3] w-full max-w-xs md:mt-0">
            <Image
              src="/images/why-easy-to-read.png"
              alt=""
              fill
              sizes="320px"
              className="object-contain drop-shadow-[0_18px_28px_rgba(82,55,125,0.16)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
