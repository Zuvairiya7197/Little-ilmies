-- Add reusable admin-managed product metadata without requiring existing rows
-- to be backfilled immediately.
CREATE TYPE "UsageLicense" AS ENUM ('PERSONAL_USE', 'PERSONAL_CLASSROOM', 'COMMERCIAL_USE');

ALTER TABLE "products"
  ADD COLUMN "author" TEXT,
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "pdfFileName" TEXT,
  ADD COLUMN "pdfFileSize" INTEGER,
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "whatsIncluded" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "learningObjectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "suitableFor" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "usageLicense" "UsageLicense" NOT NULL DEFAULT 'PERSONAL_USE',
  ADD COLUMN "licenseInfo" TEXT;

CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
