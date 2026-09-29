-- Curated age ranges for the existing catalogue, replacing the coarse
-- values carried over from the legacy "ageRange" bands. Matches on a
-- case-insensitive title prefix (titles differ slightly between
-- environments, e.g. "Numbers 1-10" vs "1–10"). Only touches the three age
-- columns; a title with no match is simply skipped. Idempotent.

UPDATE "products" AS p
SET "ageFrom" = v.age_from,
    "ageTo" = v.age_to,
    "ageOpenEnded" = false
FROM (VALUES
  ('123 Learning',                        3,  6),
  ('ABC Learning',                        3,  6),
  ('Created by Allah',                    3,  6),
  ('My Little World of Vehicles',         3,  6),
  ('Shapes in My World',                  3,  6),
  ('How Does a Seed Grow',                4,  7),
  ('How It Rains',                        4,  7),
  ('How Do Bees Make Honey',              4,  7),
  ('Why Does Night Come',                 5,  8),
  ('Asma Ul-Husna: 99 Names of Allah',    6,  9),
  ('My First Healthy Breakfasts',         6,  9),
  ('My First Healthy Lunches',            6,  9),
  ('The Boy, the Monk and the King',      7, 10)
) AS v(title_prefix, age_from, age_to)
WHERE lower(btrim(p."title")) LIKE lower(v.title_prefix) || '%';
