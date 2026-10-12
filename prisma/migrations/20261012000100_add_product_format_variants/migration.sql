-- Per-book format variants: colour PDF, black & white PDF, Rent & Read.
-- Purely additive for existing data: every existing price, download and
-- order line is the colour PDF (the only PDF that existed before).

CREATE TYPE "BookFormat" AS ENUM ('COLOUR_PDF', 'BW_PDF', 'RENT_AND_READ');

ALTER TABLE "products"
  ADD COLUMN "colourPdfEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "bwPdfEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "bwPrivatePdfPath" TEXT,
  ADD COLUMN "bwPdfFileName" TEXT,
  ADD COLUMN "bwPdfFileSize" INTEGER,
  ADD COLUMN "rentalPrice" INTEGER,
  ADD COLUMN "rentalDurationDays" INTEGER NOT NULL DEFAULT 7,
  ADD COLUMN "hardcoverComingSoon" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "product_prices" ADD COLUMN "format" "BookFormat" NOT NULL DEFAULT 'COLOUR_PDF';
DROP INDEX "product_prices_productId_currencyCode_key";
CREATE UNIQUE INDEX "product_prices_productId_format_currencyCode_key" ON "product_prices"("productId", "format", "currencyCode");

ALTER TABLE "order_items" ADD COLUMN "format" "BookFormat";
UPDATE "order_items" SET "format" = 'RENT_AND_READ' WHERE "itemType" = 'RENTAL';
UPDATE "order_items" SET "format" = 'COLOUR_PDF' WHERE "itemType" = 'PRODUCT';

ALTER TABLE "downloads" ADD COLUMN "format" "BookFormat" NOT NULL DEFAULT 'COLOUR_PDF';
DROP INDEX "downloads_orderId_productId_key";
CREATE UNIQUE INDEX "downloads_orderId_productId_format_key" ON "downloads"("orderId", "productId", "format");
