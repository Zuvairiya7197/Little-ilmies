ALTER TYPE "OrderItemType" ADD VALUE 'RENTAL';

CREATE TABLE "rental_accesses" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rentalStartedAt" TIMESTAMP(3) NOT NULL,
    "rentalExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_accesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rental_accesses_orderId_productId_key" ON "rental_accesses"("orderId", "productId");
CREATE INDEX "rental_accesses_productId_idx" ON "rental_accesses"("productId");

ALTER TABLE "rental_accesses" ADD CONSTRAINT "rental_accesses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rental_accesses" ADD CONSTRAINT "rental_accesses_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
