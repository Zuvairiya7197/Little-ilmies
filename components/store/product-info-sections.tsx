import { Check, FileText, Globe, BookOpen, Printer, Gift, Star, Heart, Download } from "lucide-react";
import { StarRating } from "@/components/store/star-rating";
import type { ProductDetail } from "@/types/catalog";

function SectionCard({
  id,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  id: string;
  icon: typeof Check;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24 rounded-3xl bg-cream-50 p-5 shadow-clay-sm xs:p-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
        </span>
        <h2 id={id} className="font-display text-lg font-bold text-ink-700 xs:text-xl">
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ProductOverview({ product }: { product: ProductDetail }) {
  return (
    <SectionCard id="overview-heading" icon={BookOpen} iconBg="bg-sage-100" iconColor="text-sage-700" title="Overview">
      <p className="max-w-2xl text-base leading-relaxed text-ink-500">{product.description}</p>
    </SectionCard>
  );
}

export function WhatsInside({ product }: { product: ProductDetail }) {
  return (
    <SectionCard id="inside-heading" icon={Gift} iconBg="bg-ink-100" iconColor="text-ink-600" title="What's Inside">
      <ul className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        {product.whatsInside.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-ink-500">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export function LearningBenefits({ product }: { product: ProductDetail }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <SectionCard
        id="benefits-heading"
        icon={Star}
        iconBg="bg-blossom-100"
        iconColor="text-blossom-600"
        title="Learning Benefits"
      >
        <ul className="flex flex-col gap-2.5">
          {product.learningBenefits.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-ink-500">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blossom-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard id="best-for-heading" icon={Heart} iconBg="bg-sage-100" iconColor="text-sage-700" title="Best For">
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
      </SectionCard>
    </div>
  );
}

export function FileDetails({ product }: { product: ProductDetail }) {
  const details = [
    { icon: FileText, label: "File type", value: product.format },
    { icon: BookOpen, label: "Pages", value: `${product.pageCount} pages` },
    { icon: Globe, label: "Language", value: product.language },
    { icon: Download, label: "Download", value: "Yes, at home in Letter or A4" },
  ];

  return (
    <SectionCard
      id="file-details-heading"
      icon={FileText}
      iconBg="bg-ink-100"
      iconColor="text-ink-600"
      title="File Details"
    >
      <dl className="grid grid-cols-1 gap-4 xs:grid-cols-2">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-cream-100 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-xs text-ink-300">{label}</dt>
              <dd className="text-sm font-semibold text-ink-700">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}

export function ProductReviews({ product }: { product: ProductDetail }) {
  const hasReviews = product.reviewCount > 0 && product.reviews.length > 0;

  return (
    <SectionCard id="reviews-heading" icon={Star} iconBg="bg-blossom-100" iconColor="text-blossom-600" title="Reviews">
      {hasReviews && (
        <div className="mb-4 flex items-center gap-2">
          <StarRating rating={product.rating} size="md" />
          <span className="text-sm font-semibold text-ink-600">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-ink-300">({product.reviewCount})</span>
        </div>
      )}

      {hasReviews ? (
        <ul className="flex flex-col gap-5">
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
      ) : (
        <p className="text-sm text-ink-400">
          No reviews yet — be the first to share what you think after your purchase.
        </p>
      )}
    </SectionCard>
  );
}
