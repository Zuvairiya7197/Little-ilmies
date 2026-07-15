"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Logo } from "@/components/store/logo";
import { SearchOverlay } from "@/components/store/search-overlay";
import { HeaderGooeySearch } from "@/components/store/header-gooey-search";
import { CartDrawer } from "@/components/store/cart-drawer";
import { MobileMenu } from "@/components/store/mobile-menu";
import { IconBadge } from "@/components/store/icon-badge";
import { AccountMenu } from "@/components/store/account-menu";
import { primaryNav } from "@/lib/nav";
import { useCartStore, selectCartCount } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { cn } from "@/lib/utils/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const isHomeHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const hydrateCurrency = useCurrencyStore((s) => s.hydrate);

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
          isHomeHero && !scrolled
            ? "bg-transparent shadow-none"
            : "bg-cream-50/95 shadow-clay-sm backdrop-blur"
        )}
      >
        <div className="container-content flex h-16 items-center justify-between gap-3 xs:h-18">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="tap-target -ml-2 flex items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm md:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <Logo />

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-ink-500 transition-all duration-200 hover:text-ink-700 hover:shadow-clay-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 xs:gap-2">
            <div className="md:hidden">
              <HeaderGooeySearch />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="tap-target hidden items-center justify-center rounded-full text-ink-500 transition-all duration-200 hover:shadow-clay-sm md:flex"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

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

            <AccountMenu />
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
