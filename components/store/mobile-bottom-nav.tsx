"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { IconBadge } from "@/components/store/icon-badge";
import { useCartStore, selectCartCount } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { cn } from "@/lib/utils/cn";

/** Amazon/Flipkart-style persistent bottom tab bar, mobile only. Search
 * lives in the mobile header alongside the hamburger menu (see
 * site-header.tsx), so the tab bar carries Home, Categories, Wishlist,
 * Cart, and Account. Always visible on mobile/tablet — never hidden, even
 * on pages with their own contextual sticky action bar (product buy bar,
 * checkout pay bar); those stack above this one instead. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();

  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const tabClass = (active: boolean) =>
    cn(
      "tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
      active ? "text-ink-700" : "text-ink-400"
    );

  return (
    <nav
      aria-label="Primary mobile"
      style={{ minHeight: "var(--mobile-nav-height)" }}
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 flex border-t border-ink-100 bg-cream-50/95 shadow-clay-sm backdrop-blur md:hidden"
    >
      <Link href="/" className={tabClass(isActive("/") && pathname === "/")}>
        <Home className="h-5 w-5" aria-hidden={true} />
        Home
      </Link>

      <Link href="/categories" className={tabClass(isActive("/categories"))}>
        <LayoutGrid className="h-5 w-5" aria-hidden={true} />
        Categories
      </Link>

      <Link
        href="/wishlist"
        aria-label={`Wishlist${mounted && wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
        className={cn("relative", tabClass(isActive("/wishlist")))}
      >
        <Heart className="h-5 w-5" aria-hidden={true} />
        Wishlist
        {mounted && (
          <span className="absolute right-[calc(50%-20px)] top-0">
            <IconBadge count={wishlistCount} />
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={openCart}
        aria-label={`Cart${mounted && cartCount > 0 ? `, ${cartCount} items` : ""}`}
        className={cn("relative", tabClass(false))}
      >
        <ShoppingBag className="h-5 w-5" aria-hidden={true} />
        Cart
        {mounted && (
          <span className="absolute right-[calc(50%-20px)] top-0">
            <IconBadge count={cartCount} />
          </span>
        )}
      </button>

      <Link
        href={status === "authenticated" ? "/account" : "/login"}
        className={tabClass(isActive("/account"))}
      >
        <User className="h-5 w-5" aria-hidden={true} />
        Account
      </Link>
    </nav>
  );
}
