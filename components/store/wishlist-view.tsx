"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Download,
  Heart,
  Home,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useWishlistLineItems } from "@/hooks/use-wishlist-line-items";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCartStore } from "@/lib/store/use-cart-store";
import { formatPrice } from "@/lib/utils/format";
import { products } from "@/data/products";

const wishlistStarterLinks = [
  { label: "Stories of the Prophets", href: "/shop/stories-of-the-prophets", icon: Sparkles },
  { label: "Quran Lessons for Kids", href: "/shop/quran-and-arabic", icon: BookOpen },
  { label: "Arabic for Kids", href: "/shop/arabic-for-kids", icon: Sparkles },
  { label: "Activities & Worksheets", href: "/shop/printable-activities", icon: Star },
] as const;

const wishlistTrustPoints = [
  { label: "Instant Download", description: "Get your ebooks immediately", icon: Download, tint: "text-gold-500" },
  { label: "Print at Home", description: "Easy to print and use anytime", icon: Printer, tint: "text-sage-600" },
  { label: "Trusted Content", description: "Authentic & beneficial Islamic content", icon: ShieldCheck, tint: "text-sunny-500" },
  { label: "Made with Love", description: "Designed for little hearts & minds", icon: Heart, tint: "text-blossom-500" },
] as const;

export function WishlistView() {
  const items = useWishlistLineItems();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.addItem);
  const relatedProducts = products.filter((product) => !items.some((item) => item.slug === product.slug)).slice(0, 5);

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20">
        <div className="container-content pb-8 pt-3 xs:pt-4 xl:pb-6 xl:pt-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-ink-600">
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span>My Wishlist</span>
          </nav>

          <div className="mx-auto mt-1 flex max-w-xl flex-col items-center text-center">
            <div className="relative aspect-[16/9] w-full max-w-sm">
              <Image
                src="/images/empty wishlist page.png"
                alt="Open book and lantern illustration for an empty wishlist"
                fill
                sizes="(max-width: 768px) 90vw, 384px"
                className="object-contain"
                priority
              />
            </div>

            <span className="mt-0 flex h-7 w-7 items-center justify-center rounded-full bg-ink-500 text-cream-50 shadow-clay-primary">
              <Heart className="h-3.5 w-3.5 fill-cream-50" aria-hidden="true" />
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink-700 xs:text-3xl">
              Your wishlist is empty
            </h1>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink-400">
              You haven&apos;t saved any books yet.
              <br />
              Start exploring and add your favorites here!
            </p>

            <Link href="/shop" className="btn-primary mt-3 px-6 py-2.5 text-sm">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Explore Books
            </Link>
          </div>

          <section className="mx-auto mt-5 max-w-4xl rounded-2xl border border-blossom-100 bg-cream-50/85 p-3 shadow-soft">
            <div className="grid gap-3 xl:grid-cols-[1fr_1.8fr] xl:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lemon-50 text-lemon-500 shadow-soft">
                  <Star className="h-5 w-5 fill-lemon-400" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold text-ink-700">Not sure where to start?</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
                    Popular collections loved by little learners and parents.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {wishlistStarterLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="tap-target flex items-center justify-between gap-3 rounded-xl bg-cream-50 px-3 py-2 text-xs font-bold text-ink-600 shadow-soft transition-colors hover:text-blossom-600"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-sage-500" aria-hidden="true" />
                      {label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <TrustStrip />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cream via-blossom-50/30 to-ink-50/20">
    <div className="container-content relative overflow-hidden pb-44 pt-14 xl:pb-6 xl:pt-5">
      <Image
        src="/images/star.png"
        alt=""
        width={42}
        height={42}
        className="pointer-events-none absolute bottom-24 left-2 hidden h-8 w-8 rotate-12 object-contain opacity-80 xl:block xl:h-10 xl:w-10"
        aria-hidden="true"
      />
      <Image
        src="/images/heart.png"
        alt=""
        width={42}
        height={42}
        className="pointer-events-none absolute bottom-16 right-2 hidden h-8 w-8 -rotate-12 object-contain opacity-80 xl:block xl:h-10 xl:w-10"
        aria-hidden="true"
      />

      <section className="grid min-h-72 grid-cols-[minmax(0,1fr)_minmax(8.5rem,42vw)] items-center gap-3 rounded-3xl sm:min-h-80 sm:grid-cols-[minmax(0,1fr)_20rem] sm:gap-4 xl:min-h-32 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-blossom-600 sm:gap-3 sm:text-2xl xl:gap-2 xl:text-xs">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 xl:h-4 xl:w-4" aria-hidden="true" />
            My Wishlist
          </p>
          <h1 className="mt-6 max-w-md font-display text-4xl font-bold leading-tight text-ink-700 sm:mt-8 sm:text-5xl xl:mt-2 xl:text-4xl">
            Books you love, all in one place
          </h1>
          <p className="mt-5 max-w-sm text-lg font-medium leading-relaxed text-ink-500 sm:mt-7 sm:text-2xl xl:mt-2 xl:text-sm xl:text-ink-400">
            Save your favorite ebooks and come back to them anytime.
          </p>
        </div>
        <div className="relative h-40 sm:h-64 xl:h-36">
          <Image
            src="/images/my wishlist.png"
            alt="Books, lantern, plant, and hearts for wishlist"
            fill
            sizes="(max-width: 768px) 90vw, 560px"
            className="object-contain"
            priority
          />
        </div>
      </section>

      <div className="mt-8 rounded-[2rem] bg-cream-50/95 p-4 shadow-clay-sm sm:p-7 xl:mt-3 xl:rounded-3xl xl:p-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-7 xl:mb-3">
          <p className="text-base font-bold text-ink-600 sm:text-xl xl:text-xs">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-base font-semibold sm:text-xl xl:text-xs">
            <button type="button" className="text-ink-500">
              Sort by: <span className="font-bold text-violet-700">Recently Added</span>{" "}
              <span className="text-violet-700" aria-hidden="true">⌄</span>
            </button>
            <button type="button" className="hidden text-ink-500 xl:inline">
              Share Wishlist
            </button>
            <button type="button" onClick={clearWishlist} className="hidden text-blossom-500 xl:inline">
              Clear All
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-5 xl:gap-2">
          {items.map((item) => (
            <li key={item.productId} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 rounded-3xl border border-ink-100 bg-white/80 p-3 shadow-soft sm:grid-cols-[8.5rem_minmax(0,1fr)_8rem] sm:items-center sm:gap-7 sm:p-5 xl:flex xl:items-center xl:gap-3 xl:rounded-2xl xl:p-2.5">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-blossom-50 sm:h-52 sm:w-32 xl:h-18 xl:w-14"
              >
                <Image src={item.coverImage} alt="" fill sizes="(max-width: 639px) 96px, (max-width: 1279px) 128px, 56px" className="object-contain p-1.5" />
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-blossom-500 sm:text-base xl:text-[10px]">
                  {item.categoryName}
                </p>
                <Link href={`/product/${item.slug}`}>
                  <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink-700 hover:text-blossom-600 sm:mt-3 sm:text-2xl xl:mt-0.5 xl:line-clamp-1 xl:text-sm">
                    {item.title}
                  </h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-400 sm:mt-4 sm:text-xl xl:mt-1 xl:line-clamp-1 xl:text-xs">{item.shortDescription}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-ink-400 sm:mt-5 sm:gap-4 sm:text-lg xl:mt-1.5 xl:gap-3 xl:text-[11px]">
                  <span>{item.pageCount} pages</span>
                  <span aria-hidden="true">•</span>
                  <span>Ages {item.ageRange}</span>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-[1fr_auto_auto] items-center gap-3 sm:col-span-1 sm:flex sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:gap-7 xl:col-span-2 xl:flex-row xl:items-center xl:justify-end xl:gap-2 sm:xl:col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist({
                      productId: item.productId,
                      slug: item.slug,
                      title: item.title,
                      coverImage: item.coverImage,
                    })
                  }
                  aria-label={`Remove ${item.title} from wishlist`}
                  className="tap-target order-2 flex h-11 w-11 items-center justify-center rounded-full bg-blossom-50 text-blossom-500 shadow-soft sm:h-14 sm:w-14 xl:h-auto xl:w-auto xl:bg-cream-50"
                >
                  <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 xl:h-4 xl:w-4" aria-hidden="true" />
                </button>
                <p className="order-1 font-display text-xl font-bold text-ink-700 sm:text-2xl xl:hidden">
                  {formatPrice(item.price, item.currencyCode)}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    addToCart({
                      productId: item.productId,
                      slug: item.slug,
                      title: item.title,
                      coverImage: item.coverImage,
                    })
                  }
                  aria-label={`Add ${item.title} to cart`}
                  className="tap-target hidden items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft xl:flex"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  href={`/product/${item.slug}`}
                  className="tap-target order-3 flex items-center justify-center rounded-full bg-ink-600 px-5 py-2.5 text-base font-bold text-cream-50 shadow-clay-primary sm:px-9 sm:py-3 sm:text-2xl xl:px-4 xl:py-0 xl:text-xs"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist({
                      productId: item.productId,
                      slug: item.slug,
                      title: item.title,
                      coverImage: item.coverImage,
                    })
                  }
                  aria-label={`Remove ${item.title} from wishlist`}
                  className="tap-target order-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream-50 text-blossom-500 shadow-soft sm:h-14 sm:w-14 xl:h-auto xl:w-auto"
                >
                  <Heart className="h-5 w-5 fill-blossom-500 sm:h-7 sm:w-7 xl:h-4 xl:w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-12 xl:mt-4 xl:rounded-3xl xl:bg-cream-50/95 xl:p-4 xl:shadow-clay-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-700 sm:gap-4 sm:text-3xl xl:gap-2 xl:text-base">
              <Star className="h-6 w-6 fill-lemon-400 text-lemon-400 sm:h-8 sm:w-8 xl:h-4 xl:w-4" aria-hidden="true" />
              You may also like
            </h2>
            <Link href="/shop" className="flex items-center gap-1 text-base font-bold text-violet-700 hover:text-blossom-600 sm:gap-2 sm:text-2xl xl:gap-1 xl:text-xs xl:text-ink-600">
              View all books
              <ChevronRight className="h-5 w-5 xl:h-3.5 xl:w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="-mx-4 mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 no-scrollbar xl:mx-0 xl:mt-3 xl:grid xl:grid-cols-5 xl:gap-3 xl:overflow-visible xl:px-0 xl:pb-0">
            {relatedProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group w-36 shrink-0 snap-start overflow-hidden rounded-3xl bg-cream-50 shadow-soft transition-transform hover:-translate-y-1 sm:w-[11.5rem] xl:w-auto xl:min-w-0 xl:rounded-2xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-3xl bg-blossom-50 xl:aspect-[4/3] xl:rounded-t-2xl">
                  <Image src={product.coverImage} alt="" fill sizes="(max-width: 1279px) 184px, 180px" className="object-contain p-2 transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4 xl:p-2.5">
                  <h3 className="line-clamp-3 min-h-16 text-sm font-bold leading-snug text-ink-700 sm:min-h-20 sm:text-base xl:line-clamp-2 xl:min-h-9 xl:text-xs">{product.title}</h3>
                  <p className="mt-5 font-display text-lg font-bold text-ink-700 sm:mt-8 sm:text-xl xl:mt-2 xl:text-sm">
                    {formatPrice(product.prices[0].salePrice ?? product.prices[0].regularPrice, product.prices[0].currencyCode)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <TrustStrip />
    </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="mx-auto mt-10 grid max-w-[48rem] grid-cols-2 gap-y-6 rounded-3xl bg-cream-50/90 px-4 py-7 shadow-soft sm:grid-cols-4 sm:gap-y-0 xl:mt-5 xl:max-w-6xl xl:grid-cols-4 xl:gap-3 xl:p-3">
      {wishlistTrustPoints.map(({ label, description, icon: Icon, tint }) => (
        <div key={label} className="flex flex-col items-center gap-3 border-r border-ink-100 px-3 text-center even:border-r-0 sm:even:border-r sm:last:border-r-0 xl:flex-row xl:gap-3 xl:border-r-0 xl:px-0 xl:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 shadow-clay-sm sm:h-14 sm:w-14 xl:h-10 xl:w-10">
            <Icon className={`h-7 w-7 sm:h-8 sm:w-8 xl:h-5 xl:w-5 ${tint}`} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold leading-tight text-ink-700 sm:text-base xl:text-xs">{label}</h2>
            <p className="mt-2 text-sm leading-snug text-ink-500 sm:text-base xl:mt-0.5 xl:text-xs xl:leading-tight xl:text-ink-400">{description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
