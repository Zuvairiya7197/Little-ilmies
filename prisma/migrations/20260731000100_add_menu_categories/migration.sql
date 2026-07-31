WITH menu_categories("id", "slug", "name", "description", "coverImage") AS (
  VALUES
    ('cat_educational', 'educational', 'Educational', 'Educational books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_activities_and_printables', 'activities-and-printables', 'Activities & Printables', 'Activities & Printables books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_aqeedah', 'aqeedah', 'Aqeedah', 'Aqeedah books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_tawheed', 'tawheed', 'Tawheed', 'Tawheed books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_stories_of_the_prophets', 'stories-of-the-prophets', 'Stories of the Prophets', 'Stories of the Prophets books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_stories_from_the_quran', 'stories-from-the-quran', 'Stories from the Qur''an', 'Stories from the Qur''an books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_sahabah', 'sahabah', 'Sahabah', 'Sahabah books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_mothers_of_the_believers', 'mothers-of-the-believers', 'Mothers of the Believers', 'Mothers of the Believers books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_good_manners', 'good-manners', 'Good Manners', 'Good Manners books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_duas_and_adhkar', 'duas-and-adhkar', 'Duas & Adhkar', 'Duas & Adhkar books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_salah', 'salah', 'Salah', 'Salah books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_ramadan', 'ramadan', 'Ramadan', 'Ramadan books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_eid', 'eid', 'Eid', 'Eid books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_hajj_and_umrah', 'hajj-and-umrah', 'Hajj & Umrah', 'Hajj & Umrah books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_daily_sunnah', 'daily-sunnah', 'Daily Sunnah', 'Daily Sunnah books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_arabic_alphabet', 'arabic-alphabet', 'Arabic Alphabet', 'Arabic Alphabet books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_arabic_reading', 'arabic-reading', 'Arabic Reading', 'Arabic Reading books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_arabic_writing', 'arabic-writing', 'Arabic Writing', 'Arabic Writing books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_tajweed', 'tajweed', 'Tajweed', 'Tajweed books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_quran_reading', 'quran-reading', 'Qur''an Reading', 'Qur''an Reading books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_memorization', 'memorization', 'Memorization', 'Memorization books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_asma_ul_husna', 'asma-ul-husna', 'Asma-ul-Husna', 'Asma-ul-Husna books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_english', 'english', 'English', 'English books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_science', 'science', 'Science', 'Science books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_social_studies', 'social-studies', 'Social Studies', 'Social Studies books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_stem', 'stem', 'STEM', 'STEM books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_worksheets', 'worksheets', 'Worksheets', 'Worksheets books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_coloring_books', 'coloring-books', 'Coloring Books', 'Coloring Books books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_flashcards', 'flashcards', 'Flashcards', 'Flashcards books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_crafts', 'crafts', 'Crafts', 'Crafts books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_posters', 'posters', 'Posters', 'Posters books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_activity_books', 'activity-books', 'Activity Books', 'Activity Books books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_games', 'games', 'Games', 'Games books and learning resources.', '/images/categories/placeholder.svg'),
    ('cat_puzzles', 'puzzles', 'Puzzles', 'Puzzles books and learning resources.', '/images/categories/placeholder.svg')
)
INSERT INTO "categories" ("id", "slug", "name", "description", "coverImage")
SELECT "id", "slug", "name", "description", "coverImage"
FROM menu_categories
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = COALESCE("categories"."description", EXCLUDED."description"),
  "coverImage" = COALESCE("categories"."coverImage", EXCLUDED."coverImage");
