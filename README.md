# Little Ilmies

A custom digital bookstore for Islamic and educational e-books for children — built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

This is being built in phases. **Phases 1–2 complete: project setup, design system, layout, header/footer, homepage, shop page with filters/sort/search, product detail page, and location-aware regional pricing.**

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (added in a later phase)
- Auth.js / NextAuth (buyer OTP/magic-link login, admin email+password) — added in a later phase
- Razorpay for payments — added in a later phase
- Zustand for cart/wishlist client state
- Framer Motion for subtle interactions
- Local private file storage for PDFs (`/private-uploads`), swappable for Cloudflare R2 later

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env` before wiring up the database/auth/payments in later phases:

```bash
cp .env.example .env
```

## Project structure

```
app/                    Routes (App Router)
components/
  ui/                   Low-level primitives
  store/                Storefront components (header, footer, product card, home sections)
  book-preview/         Book-style e-book preview components (Phase 3)
  account/              Buyer account/dashboard components (Phase 4)
  admin/                Admin dashboard components (Phase 6)
lib/
  db/                   Prisma client + queries (Phase 4+)
  auth/                 Auth.js config (Phase 4)
  storage/              Private PDF/preview/cover storage abstraction (Phase 5)
  payments/             Razorpay integration (Phase 5)
  seo/                  Structured data helpers (Phase 7)
  store/                Zustand stores (cart, wishlist)
  utils/                Shared helpers (cn, formatting)
data/                   Demo catalog data used until the database is wired up
types/                  Shared TypeScript types
styles/                 Global Tailwind styles
private-uploads/        Full PDFs, sample previews, covers — never served directly
```

## Design system

- **Colors**: warm cream background, deep ink/navy text, soft sage + muted gold accents, dusty beige sections. See `tailwind.config.ts`.
- **Typography**: Fraunces (serif, display/headings) + Plus Jakarta Sans (body).
- **Breakpoints**: mobile-first, starting at 360px (`xs`), then `sm` 480px, `md` 768px (tablet), `lg` 1024px, `xl` 1280px, `2xl` 1440px.

## Mobile-first principles used throughout

- Layouts are authored for 360px first, then progressively enhanced for tablet/desktop.
- All interactive controls use a 44px minimum tap target (`.tap-target` utility).
- Filters, cart, and search use drawers/overlays rather than being squeezed into desktop layouts.
- Horizontal snap-scroll carousels are used for category and product rails on mobile instead of cramped grids.

## Roadmap

1. ✅ Project setup, design system, layout, header, footer, homepage
2. ✅ Shop page, product grid, sorting, filters, search, product detail page
3. Book-style preview, wishlist, cart drawer, checkout UI
4. Buyer login/logout (OTP/magic link), account dashboard, purchase history, downloads
5. Razorpay integration, payment verification, webhooks, protected PDF downloads
6. Admin dashboard: products, categories, PDFs, orders, coupons
7. SEO, schema markup, sitemap/robots, performance and accessibility polish

## Regional pricing

Pricing is **manual per-region**, not live currency conversion — an admin sets
an intentional price per currency (e.g. INR 300 shown as USD 4, not a
converted 300÷83). Launch scope is deliberately **two regions**: India (INR)
and International (USD). GBP/AED exist in the data model for later use but
are not shown or detected yet.

**Security model — this is the part that matters:** pricing region is fully
automatic and detection-controlled. There is **no customer-facing currency
selector anywhere** — not in the header, not at checkout. A customer cannot
pick a cheaper region and complete checkout at that price, because there is
nothing for them to pick. Every surface (product cards, product page, cart)
shows exactly one price, in exactly one currency, resolved from detection —
never both INR and USD side by side.

- **Detection**: `middleware.ts` reads `x-vercel-ip-country` / `cf-ipcountry`
  into a cookie; `lib/pricing/detect-currency.ts` falls back to a client-side
  IP lookup (local dev) and finally to `navigator.language` region if IP
  detection fails. Only `IN → INR`, everything else `→ USD`
  (`types/pricing.ts` `COUNTRY_TO_CURRENCY`). This frontend detection is for
  *display* while browsing only — the real checkout backend (Phase 5)
  re-verifies region server-side and is the actual source of truth.
- **State**: `lib/store/use-currency-store.ts` (Zustand + localStorage) holds
  one `currency` value, set once by `hydrate()` and never overridden by the
  customer. It also exposes a `checkoutCurrency` slot and
  `selectHasRegionMismatch()` for later: once real checkout exists and the
  backend returns its verified region, if that differs from the browsing
  currency, `components/store/region-mismatch-notice.tsx` shows the one
  quiet, allowed message ("Your checkout region is different from your
  browsing region, so the price has been updated.") — and shows nothing at
  all when regions already agree. No proactive/persistent pricing disclaimer.
- **Cart**: `lib/store/use-cart-store.ts` stores only product identity, never
  a frozen price — `hooks/use-cart-line-items.ts` re-resolves every line's
  price from the live product catalog against the detected `currency` on
  every render, purely for on-screen presentation before checkout exists.

### `product_prices` table (Phase 5 — Prisma schema not yet created)

```
product_prices
  id              string   pk
  product_id      string   fk -> products.id
  pricing_region  string   e.g. "India", "International"
  country_code    string?  ISO 3166-1 alpha-2, null for the international/default row
  currency_code   string   ISO 4217 (INR, USD; GBP/AED reserved for later regions)
  regular_price   int      minor units
  sale_price      int?     minor units
  is_default      boolean  true on exactly one row per product (the USD international fallback)
  is_active       boolean
```

### Checkout pricing contract (Phase 5 — no `/checkout` backend exists yet)

This is the core rule: **the backend silently decides the final price; the
frontend price is informational only.** Concretely, when the checkout
backend is built:

- Region is determined server-side, in this priority order:
  1. IP-based country detection (server-side, e.g. the same
     `x-vercel-ip-country` header `middleware.ts` already reads).
  2. Billing country entered/confirmed during checkout.
  3. Payment method country, if the gateway exposes it (e.g. card BIN
     country, UPI region).
  4. A previously verified account country, if the buyer is logged in and
     has one on file.
- The frontend's detected `currency` (`lib/store/use-currency-store.ts`) is
  never sent to checkout as authoritative — local storage, browser locale,
  and whatever the customer was shown while browsing must never decide the
  charged price.
- On order creation, the server resolves each cart item's price from
  `product_prices` using the *verified* region above (same fallback order as
  `resolveProductPrice`: exact region match → international/USD default →
  INR emergency fallback) and recomputes subtotal/discount/tax/total itself.
  A client-submitted total or currency is never trusted.
- This validation happens silently. If the verified billing region matches
  the browsing-region currency the customer already saw, show nothing extra.
  Only show `region-mismatch-notice.tsx`'s message when they genuinely
  differ — never a generic "prices may vary" disclaimer.
- Persist the final `currency_code` and final `amount` actually charged on
  the order row. If a live FX rate is fetched for reporting/analytics, store
  it in a separate `fx_rate_at_purchase` field — it must never feed into the
  charged amount.
- Payment verification (Razorpay webhook) must confirm the paid
  amount/currency match the order the server created, not what the client
  displayed.
- Use Razorpay INR for Indian customers; only charge in another currency if
  Razorpay international currency support is enabled on the account,
  otherwise keep Stripe/PayPal as the optional path for non-INR charges.

**Explicitly disallowed:** an open "pick any country" selector that changes
the checkout price without server verification. A customer must not be able
to select a cheaper region's currency and complete checkout at that price.

## Security notes (enforced from Phase 5 onward)

- Full PDF files are never stored in `/public` and never exposed by direct URL.
- Downloads are streamed only through `/api/download/[productId]` after verifying: logged in, email verified, product owned, payment verified, download access exists.
- Payment status is verified server-side and via webhook — never trusted from the frontend.
