# Little Ilmies

An online bookstore for Islamic and educational e-books for children, live at
[littleilmies.com](https://littleilmies.com). Parents buy printable PDFs, or
in India rent a book to read online for a few days. Built with Next.js,
TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## Features

- **Storefront:** homepage sections (best sellers, new arrivals, shop by age
  and learning goal, featured collections, a flip-through sample book), a
  shop with filters and sorting, two-level categories, search, product pages
  with free preview pages, wishlist and cart.
- **Formats:** each book can be sold as a colour PDF, a black & white
  (ink-friendly) PDF and Rent & Read. A "Hardcover · Coming Soon" card can be
  shown but hardcovers can't be bought.
- **Rent & Read (India only):** pay a fraction of the price to read the book
  online for a set number of days (7 by default), with an option to upgrade
  to the PDF for the difference.
- **Bundles:** fixed bundles with set prices, and custom bundles where the
  buyer picks a number of books for a discounted price.
- **Regional pricing:** prices set by hand per currency (INR, USD, GBP, AED),
  chosen from the visitor's country. The server decides the price at
  checkout, never the browser.
- **Payments:** Razorpay, with UPI, cards, netbanking, wallets, PayPal and
  Apple Pay.
- **Accounts:** password-free magic-link sign-in, purchase history,
  downloads and rentals. Orders placed without logging in are linked to the
  account with the same email.
- **Admin dashboard** (`/admin`): products (including file uploads),
  categories, bundles, coupons, orders and refunds, buyers, a downloads
  report, pricing and storefront settings, and a storage-usage page.

## Stack

| Area | Tools |
| --- | --- |
| App | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion, lucide-react icons |
| Data | PostgreSQL, Prisma |
| Auth | NextAuth (Auth.js) v4 with JWT sessions |
| Payments | Razorpay |
| Email | Resend |
| Files | Backblaze B2 (S3-compatible), behind a Cloudflare Worker |
| Client state | Zustand (cart, wishlist, currency), saved in localStorage |
| Hosting | Vercel, behind Cloudflare |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

You need a PostgreSQL database. To run one locally on Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres createuser --superuser "$USER"
createdb little_ilmies
```

Or use a free [Neon](https://neon.tech) database and use its connection
string in the next step.

### 3. Configure environment variables

```bash
cp .env.example .env
```

For local development you only need `DATABASE_URL` and `NEXTAUTH_SECRET`
(generate one with `openssl rand -base64 32`). Everything else can stay
empty; see [Environment variables](#environment-variables) for what each one
turns on.

### 4. Create the tables and add demo data

```bash
npm run db:deploy   # applies every migration in prisma/migrations
npm run db:seed     # demo categories, books, prices and an admin account
```

The seed creates the admin `admin@littleilmies.com` / `changeme123`. Set
`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before seeding to choose your
own.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin dashboard is
at [/admin](http://localhost:3000/admin).

### Working locally without external services

- **Sign-in and emails:** without `RESEND_API_KEY`, magic links and order
  emails are printed in the terminal running `npm run dev` instead of being
  sent. Enter any email on `/login` and open the printed link.
- **Files:** without the `B2_*` variables, uploads are saved to
  `PRIVATE_UPLOADS_DIR` (`./private-uploads` in `.env.example`, git-ignored)
  and served through the app's own routes.
- **Payments:** checkout needs Razorpay test keys (`RAZORPAY_KEY_ID`,
  `RAZORPAY_KEY_SECRET`). Without them, placing an order shows an error.
- **Country:** locally there are no country headers, so the browser guesses
  the currency for display and checkout charges USD. Rent & Read (India only)
  is hidden.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Clears `.next` and starts the dev server |
| `npm run build` | Generates the Prisma client, applies migrations, builds the app |
| `npm run start` | Runs the production build |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:migrate` | Creates a new migration after you edit `prisma/schema.prisma` |
| `npm run db:deploy` | Applies pending migrations |
| `npm run db:seed` | Loads the demo data from `data/` |
| `npm run db:studio` | Opens Prisma Studio to browse the database |

`npm run build` applies migrations itself, so every Vercel deploy brings the
production database up to date.

## Environment variables

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection (required) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Signing sessions and building sign-in links (required) |
| `SITE_URL` | Links in emails, sitemap and SEO tags |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sending magic links and order emails |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Taking payments |
| `RAZORPAY_WEBHOOK_SECRET` | Checking the Razorpay webhook's signature |
| `B2_KEY_ID`, `B2_APP_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`, `B2_REGION` | Storing files in Backblaze B2 (all but the region are needed together) |
| `ASSETS_CDN_DOMAIN` | Serving files from the Cloudflare Worker (`assets.littleilmies.com`) |
| `ASSETS_SIGNING_SECRET` | Signed links to paid PDFs and rental pages on the Worker (same value on the Worker) |
| `PRIVATE_UPLOADS_DIR` | Local folder for uploads when B2 isn't set up (default `/tmp/private-uploads`) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | The admin account created by the seed |

## Project structure

```
app/                      Pages and API routes (App Router)
  admin/                  Admin login and dashboard
  account/                Buyer account: orders, downloads, rentals, details
  read/[productId]/       Full-screen Rent & Read reader
  api/checkout/           create-order, verify-payment
  api/webhooks/razorpay/  Razorpay webhook
  api/download/           Download route for paid PDFs
  api/rentals/            Rental page images, one page per request
  api/admin/              Admin APIs (products, uploads, orders, settings…)
  api/product-assets/     Covers and preview pages when no CDN is set up
components/
  store/                  Storefront (header, cards, shop, cart, checkout, home sections)
  admin/                  Admin forms and lists
  account/, rentals/, book-preview/, ui/, seo/, providers/
lib/
  db/                     Prisma client and queries (catalog, orders, admin stats)
  auth/                   NextAuth config and session/admin checks
  pricing/                Country detection, regional prices, automatic discounts
  payments/               Razorpay client and signature checks, PayPal currency rules
  checkout/               fulfillOrder: marks an order paid and grants access
  rentals/                Rent & Read rules, pricing and access check
  storage/                B2 / local-disk storage, signed Worker links, storage report
  bundles/                Custom bundle validation and order snapshots
  settings/               Admin-editable settings (discounts, hardcover card)
  email/                  Order confirmation and the shared Resend sender
  store/                  Zustand stores (cart, wishlist, currency, search)
  validation/             Zod schemas for forms and API requests
  product-formats.ts      Which formats of a book can be bought, and at what price
cloudflare/assets-worker.js  The Cloudflare Worker in front of B2
prisma/                   schema.prisma, migrations, seed.ts
data/                     Demo catalog used by the seed, plus a few fallbacks read at runtime
hooks/, types/, styles/
```

## How it works

### Catalog and formats

A `Product` has its own on/off switch and file for each PDF format
(`colourPdfEnabled` / `privatePdfPath`, `bwPdfEnabled` / `bwPrivatePdfPath`),
and its own `ProductPrice` rows per format and currency. Rent & Read needs
`rentAndReadEnabled` plus uploaded page images (`rentalPageImagePaths`).

`lib/product-formats.ts` is the single place that decides whether a format
can be bought: it must be switched on, have its file and have a price. The
storefront and checkout both use it, so a format the page doesn't show can't
be bought by editing the cart.

### Pricing

- **Regional prices are set by hand**, not converted live (for example ₹300
  and $4, not ₹300 ÷ 83). Amounts are stored in minor units (paise, cents).
- **Country:** `lib/pricing/request-country.ts` uses Cloudflare's
  `cf-ipcountry` only when the request really came through Cloudflare, and
  otherwise Vercel's `x-vercel-ip-country`. India → INR, UK → GBP, UAE →
  AED, everywhere else → USD.
- **There is no currency picker.** `middleware.ts` saves the country in a
  cookie so the browser can show prices, but checkout works the country out
  again from the request and ignores anything the browser sends.
- **Sale prices are automatic:** a store-wide discount (20% by default, set
  in admin settings) is taken off every regular price and rounded down to a
  price ending in 9 or .99 (`lib/pricing/automatic-pricing.ts`). Custom
  bundles have their own discount (15% by default).
- **Rental price:** a price set on the book, or else 25% of its INR sale
  price, rounded up to ₹5, minimum ₹20.
- **PayPal** can't charge AED, so a UAE buyer whose card fails can choose to
  pay with PayPal at the USD price.

### Checkout and payment

1. `POST /api/checkout/create-order` receives only book IDs, formats and
   quantities. It checks each line can be bought, prices it on the server,
   saves a `PENDING` order and creates a Razorpay order. Rentals must be
   checked out on their own, and only from India.
2. The browser opens Razorpay Checkout.
3. The payment is confirmed in two ways, and either is enough:
   `/api/checkout/verify-payment` (checks Razorpay's signature as soon as the
   buyer pays) and `/api/webhooks/razorpay` (in case the buyer closes the
   page). Both call `fulfillOrder()` in `lib/checkout/fulfill-order.ts`,
   which does nothing if the order is already paid.
4. `fulfillOrder()` marks the order `PAID`, creates a `Download` row for each
   PDF bought or a `RentalAccess` row with an end date (renting again extends
   an active rental), and sends the confirmation email.
5. **Guest orders:** checkout doesn't require logging in. A guest order is
   linked to the account with the same email when the payment is confirmed
   (if a verified account exists) or the next time that email signs in.
6. **Refunds** (from the admin order page) set the order to `REFUNDED`.
   Every access check requires a `PAID` order, so this removes access to the
   download or rental straight away. Issue the money refund itself in the
   Razorpay dashboard.

### Files and delivery

Files live in a private Backblaze B2 bucket under four prefixes:

| Prefix | Contents | Who can get it |
| --- | --- | --- |
| `covers/` | Book and category covers (WebP, plus a 400px `.thumb.webp` for cards) | Anyone |
| `previews/` | Free sample pages | Anyone |
| `pdfs/` | Paid PDFs | Buyers, through a signed link |
| `rentals/` | Every page of a book, for Rent & Read | Current renters, through a signed link |

`cloudflare/assets-worker.js` runs at `assets.littleilmies.com` in front of
the bucket and keeps a copy of each file at Cloudflare, so repeat requests
don't count against B2's free daily download allowance or Vercel's bandwidth.

For paid files, the site does the checks and then redirects to a Worker link
signed with `ASSETS_SIGNING_SECRET`:

- **PDFs:** `/api/download/[productId]` (`?format=bw` for black & white)
  checks the buyer is logged in, has a verified email and owns that format
  through a `PAID` order. The link expires after 5 minutes.
- **Rental pages:** `/api/rentals/[productId]/pages/[page]` checks for an
  active rental and returns one page at a time. The reader never receives the
  PDF, and each page shows a watermark with the order number.

The Worker refuses any link that is unsigned, expired or altered. Without the
Worker settings, the site falls back to direct B2 links, and without B2 to
local disk.

Admins upload large files straight from the browser to B2
(`/api/admin/products/client-upload` hands out a short-lived upload link), so
they never pass through a Vercel function.

### Sign-in

- **Buyers** sign in with a magic link emailed through Resend. There are no
  buyer passwords.
- **Admins** sign in at `/admin/login` with email and password, and must have
  `role = ADMIN`. The dashboard layout and every admin API check this.

## Deployment

Production runs on Vercel's free Hobby plan with Cloudflare in front, so the
code tries to keep heavy traffic off Vercel:

- Files come from the Cloudflare Worker, not from Vercel functions.
- `next.config.ts` limits image sizes and formats and caches optimised images
  for 31 days, to stay inside the free image allowance.
- `middleware.ts` runs on page loads only, not on API or static requests.

To deploy the Worker, paste `cloudflare/assets-worker.js` into the Worker in
the Cloudflare dashboard and set the variables listed at the top of that file.
Use a read-only B2 key there.

In the Razorpay dashboard, point the webhook at
`https://littleilmies.com/api/webhooks/razorpay` with the `payment.captured`
and `payment.failed` events. The Apple Pay domain file is in
`public/.well-known/`.

## Known gaps

- Coupons can be created in admin but aren't applied at checkout yet.
- Tax is always 0.

## Design system

- **Colours:** a light blue-grey `cream` background, deep indigo `ink` text,
  and accent colours `sage`, `gold`, `sunny`, `lemon`, `teal` and `blossom`.
  See `tailwind.config.ts`.
- **Fonts:** Baloo 2 for headings and Nunito for body text, loaded in
  `app/layout.tsx`.
- **Breakpoints:** mobile-first from 360px (`xs`), then `sm` 480px, `md`
  768px, `lg` 1024px, `xl` 1280px, `2xl` 1440px.
- **Mobile:** buttons and links are at least 44px tall (`.tap-target`),
  filters, cart and search open as drawers, and product rows scroll sideways
  on small screens.
