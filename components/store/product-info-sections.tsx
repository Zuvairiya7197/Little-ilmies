import { Check, FileText, Globe, BookOpen, Printer } from "lucide-react";
import { StarRating } from "@/components/store/star-rating";
import type { ProductDetail } from "@/types/catalog";

export function ProductOverview({ product }: { product: ProductDetail }) {
  return (
    <section aria-labelledby="overview-heading" className="scroll-mt-24">
      <h2 id="overview-heading" className="font-display text-xl font-semibold text-ink-700">
        Overview
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
        {product.description}
      </p>
    </section>
  );
}

export function WhatsInside({ product }: { product: ProductDetail }) {
  return (
    <section aria-labelledby="inside-heading" className="scroll-mt-24">
      <h2 id="inside-heading" className="font-display text-xl font-semibold text-ink-700">
        What&apos;s Inside
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2">
        {product.whatsInside.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-ink-500">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LearningBenefits({ product }: { product: ProductDetail }) {
  return (
    <section aria-labelledby="benefits-heading" className="scroll-mt-24">
      <h2 id="benefits-heading" className="font-display text-xl font-semibold text-ink-700">
        Learning Benefits
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {product.learningBenefits.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-ink-500">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <p className="section-eyebrow mb-2">Best for</p>
        <div className="flex flex-wrap gap-2">
          {product.bestFor.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sage-50 px-3 py-1.5 text-xs font-semibold text-sage-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FileDetails({ product }: { product: ProductDetail }) {
  const details = [
    { icon: FileText, label: "File type", value: product.format },
    { icon: BookOpen, label: "Pages", value: `${product.pageCount} pages` },
    { icon: Globe, label: "Language", value: product.language },
    { icon: Printer, label: "Printable", value: "Yes, at home in Letter or A4" },
  ];

  return (
    <section aria-labelledby="file-details-heading" className="scroll-mt-24">
      <h2 id="file-details-heading" className="font-display text-xl font-semibold text-ink-700">
        File Details
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 xs:grid-cols-2">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-cream-50 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-xs text-ink-300">{label}</dt>
              <dd className="text-sm font-semibold text-ink-600">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductReviews({ product }: { product: ProductDetail }) {
  return (
    <section aria-labelledby="reviews-heading" className="scroll-mt-24">
      <div className="flex items-center justify-between">
        <h2 id="reviews-heading" className="font-display text-xl font-semibold text-ink-700">
          Reviews
        </h2>
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} size="md" />
          <span className="text-sm font-semibold text-ink-600">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-ink-300">({product.reviewCount})</span>
        </div>
      </div>

      <ul className="mt-5 flex flex-col gap-5">
        {product.reviews.map((review) => (
          <li key={review.id} className="border-b border-ink-100 pb-5 last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink-600">{review.author}</p>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink-600">{review.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-400">{review.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
