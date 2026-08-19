ALTER TABLE "products"
  ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "displayOrder" INTEGER,
  ADD COLUMN "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN "productVersion" TEXT;

ALTER TABLE "product_prices"
  ADD COLUMN "saleStartDate" TIMESTAMP(3),
  ADD COLUMN "saleEndDate" TIMESTAMP(3);
