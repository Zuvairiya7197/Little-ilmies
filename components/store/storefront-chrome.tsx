"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";

/**
 * Wraps every page in the storefront header/footer/mobile nav, except
 * /admin — the admin panel has its own sidebar/layout and must never show
 * the customer-facing chrome around it. usePathname() (client-side) is
 * used instead of reading the route server-side in the root layout,
 * since that requires forwarding a custom header through middleware,
 * which proved unreliable in production behind this site's Cloudflare
 * proxy in front of Vercel.
 */
export function StorefrontChrome({
  showRentAndRead,
  children,
}: {
  showRentAndRead: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return (
      <main id="main-content" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      <SiteHeader showRentAndRead={showRentAndRead} />
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
