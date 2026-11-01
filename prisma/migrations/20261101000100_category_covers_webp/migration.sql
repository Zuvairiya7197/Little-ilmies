-- These category covers now ship as WebP only. Exact matches only, so a cover
-- an admin has uploaded since is left alone. Idempotent.

UPDATE "categories"
SET "coverImage" = regexp_replace("coverImage", '\.png$', '.webp')
WHERE "coverImage" IN (
  '/images/activities-and-printables.png',
  '/images/early-learning.png',
  '/images/islamic-learning.png',
  '/images/life-skills.png',
  '/images/science-and-nature.png'
);
