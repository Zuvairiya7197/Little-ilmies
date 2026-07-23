-- Keep production categories in sync with the primary shop category list.
-- This migration is intentionally idempotent: every insert is conflict-safe
-- and product/category joins use ON CONFLICT DO NOTHING.

WITH primary_categories("id", "slug", "name", "description", "coverImage") AS (
  VALUES
    ('cat_islamic_studies', 'islamic-studies', 'Islamic Studies', 'Core Islamic learning resources for young Muslim hearts.', '/images/categories/placeholder.svg'),
    ('cat_quran_arabic', 'quran-and-arabic', 'Qur''an & Arabic', 'Qur''an reading, Arabic basics, and Islamic vocabulary.', '/images/categories/placeholder.svg'),
    ('cat_early_learning', 'early-learning', 'Early Learning', 'Preschool foundations for letters, numbers, and first skills.', '/images/categories/placeholder.svg'),
    ('cat_languages', 'languages', 'Languages', 'Language, reading, writing, and vocabulary practice.', '/images/categories/placeholder.svg'),
    ('cat_mathematics', 'mathematics', 'Mathematics', 'Number sense, counting, operations, and math practice.', '/images/categories/placeholder.svg'),
    ('cat_science_stem', 'science-and-stem', 'Science & STEM', 'Science, nature, experiments, and STEM activities.', '/images/categories/placeholder.svg'),
    ('cat_character_building', 'character-building', 'Character Building', 'Kindness, respect, responsibility, and good manners.', '/images/categories/placeholder.svg'),
    ('cat_life_skills', 'life-skills', 'Life Skills', 'Daily habits, safety, organization, and emotional skills.', '/images/categories/placeholder.svg'),
    ('cat_creative_learning', 'creative-learning', 'Creative Learning', 'Coloring, drawing, crafts, and creative projects.', '/images/categories/placeholder.svg'),
    ('cat_printables', 'printables', 'Printables', 'Worksheets, flashcards, posters, planners, and busy books.', '/images/categories/placeholder.svg'),
    ('cat_games_activities', 'games-and-activities', 'Games & Activities', 'Puzzles, mazes, matching games, and activity books.', '/images/categories/placeholder.svg'),
    ('cat_seasonal_collections', 'seasonal-collections', 'Seasonal Collections', 'Ramadan, Eid, back-to-school, and seasonal learning.', '/images/categories/placeholder.svg'),
    ('cat_bundles', 'bundles', 'Bundles', 'Curated learning bundles and family packs.', '/images/categories/placeholder.svg'),
    ('cat_best_sellers', 'best-sellers', 'Best Sellers', 'Popular resources loved by families.', '/images/categories/placeholder.svg'),
    ('cat_new_arrivals', 'new-arrivals', 'New Arrivals', 'Recently added books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_free_downloads', 'free-downloads', 'Free Downloads', 'Free printable and digital learning resources.', '/images/categories/placeholder.svg')
)
INSERT INTO "categories" ("id", "slug", "name", "description", "coverImage")
SELECT "id", "slug", "name", "description", "coverImage"
FROM primary_categories
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "coverImage" = EXCLUDED."coverImage";

WITH category_map("oldSlug", "newSlug") AS (
  VALUES
    ('dua-and-prayers-for-kids', 'islamic-studies'),
    ('stories-of-the-prophets', 'islamic-studies'),
    ('stories-from-the-quran', 'islamic-studies'),
    ('mothers-of-the-ummah', 'islamic-studies'),
    ('ashrah-al-mubashsharah', 'islamic-studies'),
    ('kids-islamic-activity-books', 'islamic-studies'),
    ('islamic-manners-and-character', 'character-building'),
    ('arabic-for-kids', 'quran-and-arabic'),
    ('english-for-kids', 'languages'),
    ('marathi-for-kids', 'languages'),
    ('hindi-for-kids', 'languages'),
    ('preschool-learning', 'early-learning'),
    ('coloring-books', 'creative-learning'),
    ('games-and-gifts', 'games-and-activities'),
    ('math-for-kids', 'mathematics')
)
INSERT INTO "product_categories" ("productId", "categoryId")
SELECT DISTINCT pc."productId", new_category."id"
FROM "product_categories" pc
JOIN "categories" old_category ON old_category."id" = pc."categoryId"
JOIN category_map ON category_map."oldSlug" = old_category."slug"
JOIN "categories" new_category ON new_category."slug" = category_map."newSlug"
ON CONFLICT DO NOTHING;

INSERT INTO "product_categories" ("productId", "categoryId")
SELECT p."id", c."id"
FROM "products" p
JOIN "categories" c ON c."slug" = 'best-sellers'
WHERE p."isBestseller" = true
ON CONFLICT DO NOTHING;

INSERT INTO "product_categories" ("productId", "categoryId")
SELECT p."id", c."id"
FROM "products" p
JOIN "categories" c ON c."slug" = 'new-arrivals'
WHERE p."isNewArrival" = true
ON CONFLICT DO NOTHING;

DELETE FROM "product_categories"
WHERE "categoryId" IN (
  SELECT "id"
  FROM "categories"
  WHERE "slug" NOT IN (
    'islamic-studies',
    'quran-and-arabic',
    'early-learning',
    'languages',
    'mathematics',
    'science-and-stem',
    'character-building',
    'life-skills',
    'creative-learning',
    'printables',
    'games-and-activities',
    'seasonal-collections',
    'bundles',
    'best-sellers',
    'new-arrivals',
    'free-downloads'
  )
);

DELETE FROM "categories"
WHERE "slug" NOT IN (
  'islamic-studies',
  'quran-and-arabic',
  'early-learning',
  'languages',
  'mathematics',
  'science-and-stem',
  'character-building',
  'life-skills',
  'creative-learning',
  'printables',
  'games-and-activities',
  'seasonal-collections',
  'bundles',
  'best-sellers',
  'new-arrivals',
  'free-downloads'
);
