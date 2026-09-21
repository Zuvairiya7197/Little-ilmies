"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import type { Category } from "@/types/catalog";

/**
 * Wraps every page in the storefront header/footer/mobile nav, except
 * /admin and /read/[productId] — the admin panel has its own sidebar/
 * layout, and the Rent & Read reader is a deliberately full-screen,
 * distraction-free view (RentalReader renders its own h-screen main
 * with its own header/toolbar) — neither should show the customer-
 * facing storefront chrome around it. usePathname() (client-side) is
 * used instead of reading the route server-side in the root layout,
 * since that requires forwarding a custom header through middleware,
 * which proved unreliable in production behind this site's Cloudflare
 * proxy in front of Vercel.
 */
export function StorefrontChrome({
  showRentAndRead,
  categories,
  children,
}: {
  showRentAndRead: boolean;
  categories: Pick<Category, "id" | "slug" | "name" | "parentId">[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChromeless = pathname?.startsWith("/admin") || pathname?.startsWith("/read/");

  if (isChromeless) {
    return (
      <main id="main-content" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      <SiteHeader showRentAndRead={showRentAndRead} categories={categories} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <div className="pb-20 xl:pb-0">
        <SiteFooter />
      </div>
      <MobileBottomNav />
    </>
  );
}
