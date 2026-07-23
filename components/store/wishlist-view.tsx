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
    <div className="container-content relative overflow-hidden pb-8 pt-3 xs:pt-4 xl:pb-6 xl:pt-5">
      <Image
        src="/images/star.png"
        alt=""
        width={42}
        height={42}
        className="pointer-events-none absolute bottom-24 left-2 h-8 w-8 rotate-12 object-contain opacity-80 xl:h-10 xl:w-10"
        aria-hidden="true"
      />
      <Image
        src="/images/heart.png"
        alt=""
        width={42}
        height={42}
        className="pointer-events-none absolute bottom-16 right-2 h-8 w-8 -rotate-12 object-contain opacity-80 xl:h-10 xl:w-10"
        aria-hidden="true"
      />

      <section className="grid min-h-32 items-center gap-4 rounded-3xl xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-blossom-600">
            <Heart className="h-4 w-4 fill-blossom-500" aria-hidden="true" />
            My Wishlist
          </p>
          <h1 className="mt-2 max-w-md font-display text-3xl font-bold leading-tight text-ink-700 xs:text-4xl">
            Books you love, all in one place
          </h1>
          <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-ink-400">
            Save your favorite ebooks and come back to them anytime.
          </p>
        </div>
        <div className="relative hidden h-36 xl:block">
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

      <div className="mt-3 rounded-3xl bg-cream-50/95 p-3 shadow-clay-sm xl:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-ink-600">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <button type="button" className="text-ink-500">
              Sort by: <span className="font-bold text-ink-700">Recently Added</span>
            </button>
            <button type="button" className="text-ink-500">
              Share Wishlist
            </button>
            <button type="button" onClick={clearWishlist} className="text-blossom-500">
              Clear All
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white/80 p-2.5 shadow-soft">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-18 w-14 shrink-0 overflow-hidden rounded-xl bg-blossom-50"
              >
                <Image src={item.coverImage} alt="" fill sizes="56px" className="object-contain p-1.5" />
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-blossom-500">
                  {item.categoryName}
                </p>
                <Link href={`/product/${item.slug}`}>
                  <h3 className="mt-0.5 line-clamp-1 font-display text-sm font-bold text-ink-700 hover:text-blossom-600">
                    {item.title}
                  </h3>
                </Link>
                <p className="mt-1 line-clamp-1 text-xs text-ink-400">{item.shortDescription}</p>
                <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] font-medium text-ink-400">
                  <span>{item.pageCount} pages</span>
                  <span>Ages {item.ageRange}</span>
                </div>
              </div>

              <p className="hidden font-display text-sm font-bold text-ink-700 sm:block">
                {formatPrice(item.price, item.currencyCode)}
              </p>

              <div className="flex shrink-0 items-center gap-2">
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
                  className="tap-target flex items-center justify-center rounded-full bg-blossom-50 text-blossom-600 shadow-soft"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  href={`/product/${item.slug}`}
                  className="tap-target hidden items-center justify-center rounded-full bg-ink-600 px-4 text-xs font-bold text-cream-50 shadow-clay-primary sm:flex"
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
                  className="tap-target flex items-center justify-center rounded-full bg-cream-50 text-blossom-500 shadow-soft"
                >
                  <Heart className="h-4 w-4 fill-blossom-500" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-4 rounded-3xl bg-cream-50/95 p-3 shadow-clay-sm xl:p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-700">
              <Star className="h-4 w-4 fill-lemon-400 text-lemon-400" aria-hidden="true" />
              You may also like
            </h2>
            <Link href="/shop" className="flex items-center gap-1 text-xs font-bold text-ink-600 hover:text-blossom-600">
              View all books
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {relatedProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group min-w-0 rounded-2xl bg-cream-50 shadow-soft transition-transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-blossom-50">
                  <Image src={product.coverImage} alt="" fill sizes="180px" className="object-contain p-2 transition-transform group-hover:scale-105" />
                </div>
                <div className="p-2.5">
                  <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-snug text-ink-700">{product.title}</h3>
                  <p className="mt-2 font-display text-sm font-bold text-ink-700">
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
    <section className="mx-auto mt-5 grid max-w-6xl grid-cols-1 gap-3 rounded-3xl bg-cream-50/90 p-3 shadow-soft sm:grid-cols-2 xl:grid-cols-4">
      {wishlistTrustPoints.map(({ label, description, icon: Icon, tint }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream-100 shadow-clay-sm">
            <Icon className={`h-5 w-5 ${tint}`} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-ink-700">{label}</h2>
            <p className="mt-0.5 text-xs leading-tight text-ink-400">{description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
