# Little Ilmies

A custom digital bookstore for Islamic and educational e-books for children — built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

This is being built in phases. **Phases 1–5 complete: project setup, design system, layout, header/footer, homepage, shop page, product detail page, regional pricing, wishlist/cart/checkout UI, buyer/admin authentication with account dashboard, purchase history and downloads, and the Razorpay payment backend with protected PDF downloads.**

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Auth.js / NextAuth (buyer OTP/magic-link login, admin email+password)
- Razorpay for payments
- Zustand for cart/wishlist client state
- Framer Motion for subtle interactions
- Local private file storage for PDFs (`/private-uploads`), swappable for Cloudflare R2 later

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

This project needs a running local PostgreSQL instance. If you don't already
have one:

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres createuser --superuser "$USER"
createdb little_ilmies
```

(Alternatively, use a free [Neon](https://neon.tech) Postgres database and
skip straight to step 3 with Neon's connection string.)

### 3. Configure environment variables

```bash
cp .env.example .env
```

`.env` is already filled in with working local defaults (a generated
`NEXTAUTH_SECRET`, `DATABASE_URL` pointing at `little_ilmies` on
`localhost:5432`). If you used Neon instead, replace `DATABASE_URL`.

Email is intentionally left blank in `.env` for local dev — see "Buyer login
in local development" below.

### 4. Run migrations and seed demo data

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Seeding creates an admin account (`admin@littleilmies.com` / `changeme123`
by default — override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env
vars before seeding) plus all demo categories, products, and regional
prices from `data/`.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Buyer login in local development

Buyers sign in via a magic link emailed to them — there's no password. Since
`.env` has no SMTP server configured locally, the link is **printed to the
terminal running `npm run dev`** instead of actually being emailed (see
`lib/auth/config.ts`'s `sendVerificationRequest`). Enter any email on
`/login`, then copy the link from the terminal into your browser.

To send real emails instead, fill in `EMAIL_SERVER_HOST` /
`EMAIL_SERVER_PORT` / `EMAIL_SERVER_USER` / `EMAIL_SERVER_PASSWORD` in
`.env` with real SMTP credentials.

## Project structure

```
app/                    Routes (App Router)
  api/checkout/         create-order, verify-payment
  api/webhooks/razorpay Razorpay webhook handler
  api/download/[id]     Protected PDF download route
components/
  ui/                   Low-level primitives
  store/                Storefront components (header, footer, product card, home sections)
  book-preview/         Book-style e-book preview components
  account/              Buyer account/dashboard components
  admin/                Admin dashboard components (Phase 6)
lib/
  db/                   Prisma client + queries
  auth/                 Auth.js config
  storage/              Private PDF/preview/cover storage abstraction (local disk; swap for R2 later)
  payments/             Razorpay client, order creation, signature verification
  checkout/             Shared order-fulfillment logic (used by both verify-payment and the webhook)
  email/                Transactional email (order confirmation) + shared SMTP/dev-log sender
  pricing/               Regional price resolution (display-side and DB-backed) + region verification
  seo/                  Structured data helpers (Phase 7)
  store/                Zustand stores (cart, wishlist, currency)
  utils/                Shared helpers (cn, formatting)
prisma/                 schema.prisma, migrations, seed.ts
data/                   Demo catalog data (used to seed the database; not read at runtime)
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
3. ✅ Book-style preview, wishlist, cart drawer + cart page, checkout UI
4. ✅ Buyer login/logout (OTP/magic link), admin login (email+password), account dashboard, purchase history, downloads
5. ✅ Razorpay integration, payment verification, webhooks, protected PDF downloads
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
  *display* while browsing only — `lib/pricing/verify-region.ts` re-derives
  region server-side at checkout and is the actual source of truth (see
  below).
- **State**: `lib/store/use-currency-store.ts` (Zustand + localStorage) holds
  one `currency` value, set once by `hydrate()` and never overridden by the
  customer. It also exposes a `checkoutCurrency` slot and
  `selectHasRegionMismatch()`: once the checkout API returns its verified
  region, if that differs from the browsing currency,
  `components/store/region-mismatch-notice.tsx` shows the one quiet, allowed
  message ("Your checkout region is different from your browsing region, so
  the price has been updated.") — and shows nothing at all when regions
  already agree. No proactive/persistent pricing disclaimer.
- **Cart**: `lib/store/use-cart-store.ts` stores only product identity, never
  a frozen price — `hooks/use-cart-line-items.ts` re-resolves every line's
  price from the live product catalog against the detected `currency` on
  every render, purely for on-screen presentation before checkout.

### `product_prices` table (`prisma/schema.prisma`)

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

### Checkout pricing contract (implemented — `app/api/checkout/create-order`)

This is the core rule: **the backend silently decides the final price; the
frontend price is informational only.**

- Region is determined server-side via `lib/pricing/verify-region.ts`, in
  this priority order:
  1. IP-based country detection (`x-vercel-ip-country` / `cf-ipcountry`
     header, read directly on the request — not from a client-supplied
     value).
  2. Billing country, if passed to `resolveVerifiedCurrency()` (extension
     point — no billing-address collection step exists yet, so this is
     currently always IP-based).
  3. Payment method country — not exposed by Razorpay pre-payment, so not
     wired up.
  4. A previously verified account country (`Profile.countryCode`) — wired
     into the schema, not yet read at checkout (buyer profile UI doesn't
     collect it yet).
- The frontend's detected `currency` (`lib/store/use-currency-store.ts`) is
  never sent to `/api/checkout/create-order` — the request body carries only
  product IDs, quantities, and buyer name/email, never a price or currency.
- On order creation, `resolveProductPriceFromDb()`
  (`lib/pricing/resolve-price-db.ts`) resolves each cart item's price from
  `product_prices` using the *verified* region above (same fallback order as
  the display-side `resolveProductPrice`: exact region match →
  international/USD default → INR emergency fallback) and computes
  subtotal/total itself. A client-submitted total or currency is never read.
- Persist the final `currencyCode` and `totalAmount` actually charged on the
  `Order` row (`fxRateAtPurchase` exists for reporting only and is never
  read back into pricing logic).
- Payment verification (`app/api/checkout/verify-payment`, backed up by the
  `app/api/webhooks/razorpay` webhook) confirms the Razorpay HMAC signature
  before ever marking an order `PAID` — the frontend's "payment succeeded"
  callback is never trusted on its own. Both paths converge on the same
  `fulfillOrder()` (`lib/checkout/fulfill-order.ts`) so an order can't be
  fulfilled twice.
- Uses Razorpay INR by default; the Razorpay client/order-creation code is
  currency-agnostic, so enabling Razorpay's international currency support
  (or adding Stripe/PayPal) only requires touching `lib/payments/`.

**Explicitly disallowed and not present anywhere in this codebase:** an open
"pick any country" selector that changes the checkout price without server
verification.

## Security notes

- Full PDF files are never stored in `/public` and never exposed by direct URL — see `lib/storage/index.ts`, which resolves every stored path against `PRIVATE_UPLOADS_DIR` and rejects anything that would escape it.
- Downloads are streamed only through `/api/download/[productId]` after verifying, in order: logged in → email verified → product owned via a `PAID` order → download access record exists → not expired. Verified end-to-end: an authenticated user with no purchase gets a 403, not a file.
- Payment status is verified server-side (`verifyPaymentSignature`) and via the Razorpay webhook (`verifyWebhookSignature`) — the frontend's payment callback is informational only, never the trigger that marks an order paid.
- `/api/checkout/create-order` fails fast (before writing anything to the database) if Razorpay isn't configured, and marks the order `FAILED` rather than leaving it `PENDING` if order creation fails after the local row already exists.
