-- Real customer reviews: moderation status, one review per buyer per book,
-- and a reward coupon locked to the reviewer's email — one per order.
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ReviewSource" AS ENUM ('BUYER', 'GIFTED');

ALTER TABLE "reviews"
  ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "source" "ReviewSource" NOT NULL DEFAULT 'BUYER',
  ADD COLUMN "isFirstReview" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "rewardCouponId" TEXT,
  ADD COLUMN "rewardOrderId" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "coupons" ADD COLUMN "restrictedToEmail" TEXT;

CREATE UNIQUE INDEX "reviews_rewardCouponId_key" ON "reviews"("rewardCouponId");
CREATE UNIQUE INDEX "reviews_rewardOrderId_key" ON "reviews"("rewardOrderId");
CREATE UNIQUE INDEX "reviews_productId_userId_key" ON "reviews"("productId", "userId");
CREATE INDEX "reviews_productId_status_idx" ON "reviews"("productId", "status");
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rewardCouponId_fkey"
  FOREIGN KEY ("rewardCouponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rewardOrderId_fkey"
  FOREIGN KEY ("rewardOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ratings now come only from approved reviews; clear any hand-set numbers.
UPDATE "products" p
SET "rating" = COALESCE(
      (SELECT ROUND(AVG(r."rating")::numeric, 1) FROM "reviews" r
       WHERE r."productId" = p."id" AND r."status" = 'APPROVED'), 0),
    "reviewCount" = (SELECT COUNT(*) FROM "reviews" r
       WHERE r."productId" = p."id" AND r."status" = 'APPROVED');
