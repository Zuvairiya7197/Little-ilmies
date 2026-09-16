import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Baloo_2, Nunito } from "next/font/google";
import "@/styles/globals.css";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { isRentalEligibleFromHeaders } from "@/lib/rentals/eligibility";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.SITE_URL ?? "https://littleilmies.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Little Ilmies — Islamic & Educational E-Books for Young Hearts",
    template: "%s — Little Ilmies",
  },
  description:
    "Authentic, printable, child-friendly Islamic and educational e-books for young Muslim hearts. Instant digital downloads, designed for home, madrasa, and homeschooling.",
  keywords: [
    "Islamic e-books for kids",
    "Islamic books for children",
    "Muslim kids books",
    "printable Islamic worksheets",
    "stories of the prophets for kids",
  ],
  openGraph: {
    type: "website",
    siteName: "Little Ilmies",
    title: "Little Ilmies — Islamic & Educational E-Books for Young Hearts",
    description:
      "Authentic, printable, child-friendly Islamic and educational e-books for young Muslim hearts.",
    url: siteUrl,
    images: [{ url: "/images/little_ilmies_logo.png", width: 1000, height: 1000, alt: "Little Ilmies" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Ilmies — Islamic & Educational E-Books for Young Hearts",
    description:
      "Authentic, printable, child-friendly Islamic and educational e-books for young Muslim hearts.",
    images: ["/images/little_ilmies_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F0F5FA",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  // The admin panel has its own sidebar/nav (see app/admin/(dashboard)/layout.tsx)
  // and must never show the customer-facing storefront header/footer/mobile
  // nav around it — those were previously wrapping every page unconditionally,
  // including /admin, which is why the storefront logo/nav appeared to
  // "scroll away" above the admin sidebar instead of the admin UI owning the
  // whole viewport.
  const isAdminRoute = (headerStore.get("x-pathname") ?? "").startsWith("/admin");
  const showRentAndRead = isAdminRoute ? false : await isRentalEligibleFromHeaders();

  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream font-sans text-ink-500">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink-500 focus:px-5 focus:py-3 focus:text-cream-50"
        >
          Skip to main content
        </a>
        <AuthSessionProvider>
          {isAdminRoute ? (
            <main id="main-content" className="flex-1">
              {children}
            </main>
          ) : (
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
          )}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
