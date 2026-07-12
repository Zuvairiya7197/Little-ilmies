import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
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
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
