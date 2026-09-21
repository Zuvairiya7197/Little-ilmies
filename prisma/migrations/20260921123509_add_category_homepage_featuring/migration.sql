-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "iconKey" TEXT,
ADD COLUMN     "isFeaturedOnHomepage" BOOLEAN NOT NULL DEFAULT false;
