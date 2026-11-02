"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, ArrowLeft, Heart, ShoppingBag, User } from "lucide-react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Logo } from "@/components/store/logo";
import { SearchOverlay } from "@/components/store/search-overlay";
import { HeaderGooeySearch } from "@/components/store/header-gooey-search";
import { BooksMegaMenu } from "@/components/store/books-mega-menu";
import { CartDrawer } from "@/components/store/cart-drawer";
import { IconBadge } from "@/components/store/icon-badge";
import { AccountMenu } from "@/components/store/account-menu";
import { MobileMenu } from "@/components/store/mobile-menu";
import { useCartStore, selectCartCount } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { useSearchStore } from "@/lib/store/use-search-store";
import { cn } from "@/lib/utils/cn";
import { isNavLinkActive, shopNavLinks } from "@/lib/store-navigation";
import type { Category } from "@/types/catalog";

const navLinkClass =
  "tap-target flex items-center rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 hover:bg-cream-50 hover:shadow-clay-sm";
const navLinkActiveClass = "bg-sage-50 text-sage-700 shadow-clay-sm";

/** A header link that highlights itself on the page it points to. */
function ShopNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = isNavLinkActive(href, pathname, searchParams);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(navLinkClass, active ? navLinkActiveClass : "text-ink-600")}
    >
      {label}
    </Link>
  );
}

const printablesHref = shopNavLinks.find((item) => item.label === "Printables")?.href;

export function SiteHeader({
  showRentAndRead = false,
  categories = [],
}: {
  showRentAndRead?: boolean;
  categories?: Pick<Category, "id" | "slug" | "name" | "parentId">[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/product/");
  const isAccountSubPage = pathname.startsWith("/account/");
  const isWishlistPage = pathname === "/wishlist";
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const hydrateCurrency = useCurrencyStore((s) => s.hydrate);
  const searchOpen = useSearchStore((s) => s.isOpen);
  const closeSearch = useSearchStore((s) => s.closeSearch);

  useEffect(() => {
    setMounted(true);
    hydrateCurrency();
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hydrateCurrency]);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div
        className={cn(
          "transition-all duration-200",
          !scrolled
            ? "bg-transparent shadow-none"
            : "bg-cream-50/95 shadow-clay-sm backdrop-blur"
        )}
      >
        <div className="container-content flex h-20 items-center justify-between gap-3 xs:h-24 lg:h-16 xl:h-18">
          {isProductPage || isAccountSubPage || isWishlistPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="tap-target flex items-center justify-center rounded-full text-ink-600 lg:hidden"
            >
              <ArrowLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="tap-target flex items-center justify-center rounded-full text-ink-600 lg:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <Logo className="h-16 xs:h-20 lg:h-16 xl:h-20" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              <li>
                <BooksMegaMenu
                  categories={categories}
                  active={pathname.startsWith("/shop/") && pathname !== printablesHref}
                />
              </li>
              {shopNavLinks.map((item) => (
                <Fragment key={item.href}>
                  <li>
                    {/* useSearchParams needs a Suspense boundary on static pages. */}
                    <Suspense
                      fallback={
                        <Link href={item.href} className={cn(navLinkClass, "text-ink-600")}>
                          {item.label}
                        </Link>
                      }
                    >
                      <ShopNavLink href={item.href} label={item.label} />
                    </Suspense>
                  </li>
                  {showRentAndRead && item.label === "Bundles" && (
                    <li>
                    <Link
                      href="/rent-and-read"
                      aria-current={pathname === "/rent-and-read" ? "page" : undefined}
                      className={cn(navLinkClass, pathname === "/rent-and-read" ? navLinkActiveClass : "text-ink-600")}
                    >
                      Rent & Read
                    </Link>
                    </li>
                  )}
                </Fragment>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 xs:gap-2">
            <HeaderGooeySearch />

            <Link
              href="/wishlist"
              aria-label={`Wishlist${mounted && wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              className="tap-target relative flex items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {mounted && <IconBadge count={wishlistCount} />}
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart${mounted && cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="tap-target relative flex items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {mounted && <IconBadge count={cartCount} />}
            </button>

            <div className="hidden lg:block">
              <AccountMenu />
            </div>

            <Link
              href="/account"
              aria-label="Account"
              className="tap-target flex items-center justify-center rounded-full bg-lilac-50 text-ink-500 transition-all duration-200 hover:shadow-clay-sm lg:hidden"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        showRentAndRead={showRentAndRead}
        categories={categories}
      />
    </header>
  );
}
