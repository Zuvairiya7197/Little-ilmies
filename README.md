# Little Ilmies

A custom digital bookstore for Islamic and educational e-books for children — built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

This is being built in phases. **Phase 1 (this commit): project setup, design system, layout, header, footer, and homepage.**

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
2. Shop page, product grid, sorting, filters, search, product detail page
3. Book-style preview, wishlist, cart drawer, checkout UI
4. Buyer login/logout (OTP/magic link), account dashboard, purchase history, downloads
5. Razorpay integration, payment verification, webhooks, protected PDF downloads
6. Admin dashboard: products, categories, PDFs, orders, coupons
7. SEO, schema markup, sitemap/robots, performance and accessibility polish

## Security notes (enforced from Phase 5 onward)

- Full PDF files are never stored in `/public` and never exposed by direct URL.
- Downloads are streamed only through `/api/download/[productId]` after verifying: logged in, email verified, product owned, payment verified, download access exists.
- Payment status is verified server-side and via webhook — never trusted from the frontend.
