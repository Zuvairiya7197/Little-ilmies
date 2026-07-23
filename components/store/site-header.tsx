"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, ArrowLeft, Heart, ShoppingBag, Moon, Languages, GraduationCap, PenTool, HandHeart, Star } from "lucide-react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Logo } from "@/components/store/logo";
import { SearchOverlay } from "@/components/store/search-overlay";
import { HeaderGooeySearch } from "@/components/store/header-gooey-search";
import { CartDrawer } from "@/components/store/cart-drawer";
import { IconBadge } from "@/components/store/icon-badge";
import { AccountMenu } from "@/components/store/account-menu";
import { MobileMenu } from "@/components/store/mobile-menu";
import { useCartStore, selectCartCount } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useCurrencyStore } from "@/lib/store/use-currency-store";
import { useSearchStore } from "@/lib/store/use-search-store";
import { cn } from "@/lib/utils/cn";

const chipNav = [
  { label: "Islamic", href: "/shop/islamic-books", icon: Moon },
  { label: "Arabic", href: "/shop/arabic-for-kids", icon: Languages },
  { label: "Educational", href: "/shop/educational-books", icon: GraduationCap },
  { label: "Activities", href: "/shop/coloring-books", icon: PenTool },
  { label: "Duas", href: "/shop/dua-and-prayers-for-kids", icon: HandHeart },
  { label: "Best Sellers", href: "/shop?sort=bestselling", icon: Star },
] as const;

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/product/");
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
        <div className="container-content flex h-16 items-center justify-between gap-3 xs:h-18">
          {isProductPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="tap-target flex items-center justify-center rounded-full text-ink-600 md:hidden"
            >
              <ArrowLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="tap-target flex items-center justify-center rounded-full text-ink-600 md:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <Logo className="h-16 xs:h-20" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-2">
              {chipNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="tap-target flex items-center gap-1.5 rounded-full bg-cream-50 px-3.5 py-2 text-sm font-semibold text-ink-600 shadow-clay-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay"
                  >
                    <item.icon className="h-4 w-4 text-ink-400" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
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

            <div className="hidden md:block">
              <AccountMenu />
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
