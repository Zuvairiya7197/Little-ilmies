import Link from "next/link";

export function ParentCta() {
  return (
    <section className="py-12 xs:py-14 md:py-20">
      <div className="container-content">
        <div className="relative overflow-hidden rounded-3xl bg-ink-500 px-6 py-12 text-center xs:px-10 xs:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,theme(colors.sage.700/0.35),transparent_45%),radial-gradient(circle_at_85%_80%,theme(colors.gold.700/0.3),transparent_45%)]" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-2xl font-semibold text-cream-50 xs:text-3xl md:text-4xl">
              Start building your child&apos;s Islamic learning library today.
            </h2>
            <p className="mt-4 text-sm text-cream-200 xs:text-base">
              Instant downloads, printable at home, and loved by thousands of
              Muslim families.
            </p>
            <Link
              href="/shop"
              className="btn-accent mt-7 inline-flex"
            >
              Explore All Books
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
