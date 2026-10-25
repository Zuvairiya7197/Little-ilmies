-- Guest orders (placed while logged out) were never linked to the buyer's
-- account, so their downloads and rentals didn't show up after logging in.
-- Links every existing guest order to the verified account with the same
-- email (case-insensitive). New guest orders are linked by the app itself.
-- Idempotent: only touches orders that have no user yet.

UPDATE "orders" AS o
SET "userId" = u."id"
FROM "users" AS u
WHERE o."userId" IS NULL
  AND u."emailVerified" IS NOT NULL
  AND lower(trim(o."buyerEmail")) = lower(u."email");
