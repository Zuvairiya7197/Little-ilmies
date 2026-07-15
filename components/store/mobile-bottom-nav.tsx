"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, BookOpen, Heart, ShoppingBag, User } from "lucide-react";
import { IconBadge } from "@/components/store/icon-badge";
import { useCartStore, selectCartCount } from "@/lib/store/use-cart-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { cn } from "@/lib/utils/cn";

/** Amazon/Flipkart-style persistent bottom tab bar, mobile only. Replaces
 * the hamburger drawer + header wishlist/cart icons — the mobile header now
 * carries just the logo and search (see site-header.tsx). */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

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
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-100 bg-cream-50/95 shadow-clay-sm backdrop-blur md:hidden"
    >
      <Link href="/" className={tabClass(isActive("/") && pathname === "/")}>
        <Home className="h-5 w-5" aria-hidden={true} />
        Home
      </Link>

      <Link href="/shop" className={tabClass(isActive("/shop"))}>
        <BookOpen className="h-5 w-5" aria-hidden={true} />
        Shop
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
        className={tabClass(isActive("/account") || isActive("/login"))}
      >
        <User className="h-5 w-5" aria-hidden={true} />
        Account
      </Link>
    </nav>
  );
}
