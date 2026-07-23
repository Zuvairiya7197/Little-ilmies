import Image from "next/image";

const reasons = [
  {
    title: "Authentic Islamic Content",
    description: "Carefully curated Islamic resources",
    image: "/images/why-authentic-content.png",
    cardBg: "bg-ink-50",
  },
  {
    title: "Instant Digital Download",
    description: "Get your books right away",
    image: "/images/why-instant-download.png",
    cardBg: "bg-sunny-50",
  },
  {
    title: "Printable PDF",
    description: "Easy to print and use",
    image: "/images/why-print-at-home.png",
    cardBg: "bg-teal-50",
  },
  {
    title: "Kid Friendly",
    description: "Designed for young Muslim minds",
    image: "/images/why-loved-by-parents.png",
    cardBg: "bg-blossom-50",
  },
  {
    title: "Easy To Read",
    description: "Simple language and clear layout",
    image: "/images/why-easy-to-read.png",
    cardBg: "bg-sunny-50",
  },
  {
    title: "Secure Checkout",
    description: "Safe, secure & trusted payments",
    image: "/images/why-secure-checkout.png",
    cardBg: "bg-ink-50",
  },
] as const;

export function WhyParentsChoose() {
  return (
    <section aria-label="Why parents choose Little Ilmies" className="border-y border-ink-100 bg-cream-100 py-8 xs:py-10 md:py-12">
      <div className="container-content">
        <h2 className="font-display text-2xl font-semibold text-ink-700 md:text-center md:text-3xl">
          Why Parents Choose Little Ilmies
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-6 md:gap-5">
          {reasons.map(({ title, description, image, cardBg }) => (
            <div
              key={title}
              className={`flex h-full flex-col items-center justify-start rounded-3xl px-4 pb-4 pt-2 text-center shadow-clay-sm md:px-6 md:pb-6 md:pt-2 ${cardBg}`}
            >
              <div className="relative -mb-3 h-24 w-24 shrink-0 md:-mb-5 md:h-36 md:w-36">
                <Image src={image} alt="" fill sizes="144px" className="object-contain" />
              </div>
              <p className="font-display text-sm font-semibold leading-snug text-ink-700 md:text-base">
                {title}
              </p>
              <p className="text-xs leading-snug text-ink-400 md:text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
