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
              className={`flex flex-col items-center gap-2 rounded-3xl p-4 text-center shadow-clay-sm md:p-6 ${cardBg}`}
            >
              <div className="relative h-20 w-20 shrink-0 md:h-28 md:w-28">
                <Image src={image} alt="" fill sizes="112px" className="object-contain" />
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
