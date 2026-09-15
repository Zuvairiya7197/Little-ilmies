import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, XCircle } from "lucide-react";

const features = [
  { icon: BookOpen, label: "Read online", tint: "bg-ink-50 text-ink-400" },
  { icon: Clock, label: "7 days access", tint: "bg-sage-50 text-sage-600" },
  { icon: XCircle, label: "No PDF download", tint: "bg-blossom-50 text-blossom-500" },
] as const;

export function RentAndReadHighlight() {
  return (
    <section aria-labelledby="rent-read-heading" className="py-10 xs:py-12 md:py-16">
      <div className="container-content">
        <div className="relative overflow-hidden rounded-3xl bg-cream-50 p-6 shadow-clay-sm md:grid md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] md:items-center md:gap-8 md:p-10">
          <div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-ink-300" aria-hidden="true" />
              <p className="section-eyebrow whitespace-nowrap text-ink-300">Rent &amp; Read</p>
              <span className="h-px w-24 bg-ink-100 xs:w-36" aria-hidden="true" />
            </div>
            <h2 id="rent-read-heading" className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight text-ink-700 xs:text-3xl md:text-4xl">
              Not ready to buy? Read it first.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-400 xs:text-base">
              Enjoy selected Little Ilmies books online for 7 days, starting from just ₹20.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 xs:gap-x-6">
              {features.map(({ icon: Icon, label, tint }, index) => (
                <div key={label} className="flex items-center gap-5 xs:gap-6">
                  {index > 0 && <span className="hidden h-8 w-px bg-ink-100 xs:block" aria-hidden="true" />}
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-ink-600">{label}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/rent-and-read" className="btn-primary mt-7">
              Explore Rent &amp; Read
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mt-8 hidden aspect-[16/9] w-full md:mt-0 md:block" aria-hidden="true">
            <Image
              src="/images/rent and read.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 40vw, 480px"
              className="object-contain object-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
