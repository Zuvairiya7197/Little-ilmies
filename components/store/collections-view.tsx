import { Sparkles } from "lucide-react";
import { collections, CollectionCard } from "@/components/store/home/featured-collections";

export function CollectionsView() {
  return (
    <div className="container-content py-6 xs:py-8 md:py-10">
      <div className="mx-auto mb-8 max-w-xl text-center xs:mb-10">
        <p className="section-eyebrow inline-flex items-center gap-1.5 justify-center">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Featured Collections
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-700 xs:text-3xl">
          Curated for every learning moment
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-400 xs:text-base">
          Explore handpicked e-books and activities that inspire faith, build
          character, and make learning delightful.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {collections.map((collection) => (
          <CollectionCard key={collection.title} {...collection} />
        ))}
      </div>
    </div>
  );
}
