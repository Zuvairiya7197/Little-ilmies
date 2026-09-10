-- CreateEnum
CREATE TYPE "BundleType" AS ENUM ('FIXED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PRODUCT', 'CUSTOM_BUNDLE');

-- AlterTable
ALTER TABLE "bundles" ADD COLUMN "type" "BundleType" NOT NULL DEFAULT 'FIXED';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "bundleId" TEXT,
ADD COLUMN "bundleSnapshot" JSONB,
ADD COLUMN "itemType" "OrderItemType" NOT NULL DEFAULT 'PRODUCT',
ALTER COLUMN "productId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "custom_bundle_prices" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_bundle_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_bundle_selections" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "custom_bundle_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_bundle_prices_bundleId_quantity_idx" ON "custom_bundle_prices"("bundleId", "quantity");

-- CreateIndex
CREATE UNIQUE INDEX "custom_bundle_prices_bundleId_quantity_currencyCode_key" ON "custom_bundle_prices"("bundleId", "quantity", "currencyCode");

-- CreateIndex
CREATE INDEX "custom_bundle_selections_bundleId_idx" ON "custom_bundle_selections"("bundleId");

-- CreateIndex
CREATE INDEX "custom_bundle_selections_productId_idx" ON "custom_bundle_selections"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_bundle_selections_orderItemId_productId_key" ON "custom_bundle_selections"("orderItemId", "productId");

-- AddForeignKey
ALTER TABLE "custom_bundle_prices" ADD CONSTRAINT "custom_bundle_prices_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_bundle_selections" ADD CONSTRAINT "custom_bundle_selections_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_bundle_selections" ADD CONSTRAINT "custom_bundle_selections_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_bundle_selections" ADD CONSTRAINT "custom_bundle_selections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
