-- Replace the fixed "ageRange" text band with numeric ageFrom/ageTo/ageOpenEnded.
-- Additive and idempotent: the legacy "ageRange" column and its values are
-- kept (only made nullable), and rows that already have numeric ages are
-- never touched, so re-running this is a no-op.

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ageFrom" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ageTo" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "ageOpenEnded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ALTER COLUMN "ageRange" DROP NOT NULL;

-- "0-3", "3-6", "6-9", "9-12" (also tolerates an en dash / spaces).
UPDATE "products"
SET "ageFrom" = (regexp_match(btrim("ageRange"), '^(\d+)\s*[-–]\s*(\d+)$'))[1]::INTEGER,
    "ageTo"   = (regexp_match(btrim("ageRange"), '^(\d+)\s*[-–]\s*(\d+)$'))[2]::INTEGER,
    "ageOpenEnded" = false
WHERE "ageFrom" IS NULL
  AND "ageTo" IS NULL
  AND btrim("ageRange") ~ '^\d+\s*[-–]\s*\d+$';

-- "12+" → ageFrom 12, ageTo 18, open-ended.
UPDATE "products"
SET "ageFrom" = (regexp_match(btrim("ageRange"), '^(\d+)\s*\+$'))[1]::INTEGER,
    "ageTo"   = 18,
    "ageOpenEnded" = true
WHERE "ageFrom" IS NULL
  AND "ageTo" IS NULL
  AND btrim("ageRange") ~ '^\d+\s*\+$';

-- Rollback (manual; not run by Prisma):
--   UPDATE "products" SET "ageRange" = CASE
--     WHEN "ageOpenEnded" THEN "ageFrom" || '+'
--     ELSE "ageFrom" || '-' || "ageTo" END
--   WHERE "ageRange" IS NULL AND "ageFrom" IS NOT NULL;
--   ALTER TABLE "products" DROP COLUMN "ageFrom", DROP COLUMN "ageTo", DROP COLUMN "ageOpenEnded";
--   -- then, only if every row has a value: ALTER TABLE "products" ALTER COLUMN "ageRange" SET NOT NULL;
