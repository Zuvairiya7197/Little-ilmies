-- Add a soft-delete marker for products that must be preserved for past
-- order history but should disappear from admin/store listings.
ALTER TABLE "products" ADD COLUMN "archivedAt" TIMESTAMP(3);
