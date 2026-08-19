UPDATE "products"
SET
  "title" = 'Asma Ul-Husna: 99 Names of Allah',
  "author" = 'Zuvairiya Maryam',
  "slug" = 'asma-ul-husna-99-names-of-allah',
  "sku" = 'LI-ASMA-001',
  "shortDescription" = 'A child-friendly journey through the 99 Names of Allah, helping young learners understand, remember, and reflect upon His Beautiful Names through simple explanations and engaging activities.',
  "description" = $$Help your child learn the 99 Beautiful Names of Allah in a simple, meaningful, and engaging way.

This 31-page Islamic educational eBook introduces children to the Names of Allah through simple explanations, questions, reflection activities, and practical lessons connected to everyday life.

The book is designed not only for memorization, but to help children learn, understand, believe in, and act upon the Names of Allah. It encourages love for Allah, strengthens understanding of Tawheed, and connects Islamic learning with good character and daily actions.

The content is based on the Qur’an and authentic Hadith according to the understanding of the Salaf-us-Salih. It uses child-friendly language and interactive activities to make learning engaging while keeping the focus on authentic Islamic teachings.

Children will explore the meanings of the Names of Allah through activities such as questions, multiple-choice exercises, reflection prompts, and practical actions. The book covers themes including Allah's mercy, knowledge, power, wisdom, forgiveness, provision, guidance, protection, Tawheed, patience, gratitude, and more.

The book also includes an introduction for parents, an explanation of the importance of learning the Names of Allah, an author section, and a closing section connecting families with Little Ilmies.

Suitable for: Islamic studies, homeschooling, home learning, and teaching children about the Names of Allah.

Digital Product: Printable PDF eBook. No physical product will be shipped.

This eBook is licensed for individual use and may not be shared or redistributed.$$,
  "tags" = ARRAY[
    '99 Names of Allah',
    'Asma Ul Husna',
    'Names of Allah',
    'Islamic Studies',
    'Tawheed',
    'Aqeedah',
    'Islamic Book for Kids',
    'Islamic Education',
    'Muslim Kids',
    'Islamic Homeschool',
    'Islamic Activities',
    'Islamic Printable',
    'Quran and Hadith',
    'Salaf',
    'Allah Names for Children'
  ]::TEXT[],
  "whatsIncluded" = ARRAY[
    '99 Names of Allah',
    'Meanings of the Names',
    'Child-friendly explanations',
    'Reflection questions',
    'Multiple-choice activities',
    'Practical learning activities',
    'Tawheed-focused lessons',
    'Parent introduction',
    'Islamic learning prompts'
  ]::TEXT[],
  "learningObjectives" = ARRAY[
    'Learn the Beautiful Names of Allah',
    'Understand the meanings of the Names',
    'Reflect upon the Names of Allah',
    'Strengthen understanding of Tawheed',
    'Develop love for Allah',
    'Connect Islamic learning with everyday actions',
    'Practise good Islamic character',
    'Learn through questions and activities'
  ]::TEXT[],
  "suitableFor" = ARRAY[
    'Islamic homeschooling',
    'Home learning',
    'Islamic studies',
    'Parent-child learning',
    'Weekend Islamic classes',
    'Muslim families',
    'Children learning the Names of Allah'
  ]::TEXT[],
  "ageRange" = '6-9',
  "language" = 'English',
  "format" = 'PDF',
  "pageCount" = 31,
  "isBestseller" = true,
  "isNewArrival" = false,
  "isFeatured" = true,
  "hasFreePreview" = true,
  "isHomepageSample" = true,
  "displayOrder" = 1,
  "usageLicense" = 'PERSONAL_USE',
  "licenseInfo" = 'This eBook is for individual use only. It may not be shared, redistributed, or resold.',
  "baseCurrency" = 'INR',
  "productVersion" = '1.0',
  "seoTitle" = '99 Names of Allah for Kids | Asma Ul-Husna Printable PDF',
  "seoDescription" = 'Help children learn the 99 Names of Allah through simple explanations, reflection questions and engaging activities based on the Qur’an and authentic Hadith.',
  "seoKeywords" = ARRAY[
    '99 Names of Allah for kids',
    'Asma Ul Husna for kids',
    'Names of Allah for children',
    'Islamic book for kids',
    'Islamic studies PDF',
    'Tawheed for children',
    'Islamic homeschool',
    'Islamic activities for kids',
    'Muslim kids learning',
    'Islamic printable',
    'Allah Names for children'
  ]::TEXT[],
  "status" = 'PUBLISHED',
  "publishedAt" = COALESCE("publishedAt", NOW())
WHERE "slug" = 'asma-ul-husna-99-names-of-allah'
   OR "sku" = 'LI-ASMA-001'
   OR "title" = 'Asma Ul-Husna: 99 Names of Allah';

DELETE FROM "product_categories"
WHERE "productId" IN (SELECT "id" FROM "products" WHERE "sku" = 'LI-ASMA-001')
  AND "categoryId" NOT IN (SELECT "id" FROM "categories" WHERE "slug" = 'islamic-studies');

INSERT INTO "product_categories" ("productId", "categoryId")
SELECT p."id", c."id"
FROM "products" p
CROSS JOIN "categories" c
WHERE p."sku" = 'LI-ASMA-001'
  AND c."slug" = 'islamic-studies'
ON CONFLICT ("productId", "categoryId") DO NOTHING;

UPDATE "product_prices"
SET "isDefault" = false
WHERE "productId" IN (SELECT "id" FROM "products" WHERE "sku" = 'LI-ASMA-001');

INSERT INTO "product_prices" (
  "id",
  "productId",
  "pricingRegion",
  "countryCode",
  "currencyCode",
  "regularPrice",
  "salePrice",
  "saleStartDate",
  "saleEndDate",
  "isDefault",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'price_' || p."id" || '_' || LOWER(v."currencyCode"),
  p."id",
  v."pricingRegion",
  v."countryCode",
  v."currencyCode",
  v."regularPrice",
  v."salePrice",
  NULL,
  NULL,
  v."isDefault",
  true,
  NOW(),
  NOW()
FROM "products" p
CROSS JOIN (
  VALUES
    ('India', 'IN', 'INR', 29900, 24900, true),
    ('International', NULL, 'USD', 599, 499, false),
    ('United Kingdom', 'GB', 'GBP', 599, 499, false),
    ('United Arab Emirates', 'AE', 'AED', 1500, 1200, false)
) AS v("pricingRegion", "countryCode", "currencyCode", "regularPrice", "salePrice", "isDefault")
WHERE p."sku" = 'LI-ASMA-001'
ON CONFLICT ("productId", "currencyCode") DO UPDATE
SET
  "pricingRegion" = EXCLUDED."pricingRegion",
  "countryCode" = EXCLUDED."countryCode",
  "regularPrice" = EXCLUDED."regularPrice",
  "salePrice" = EXCLUDED."salePrice",
  "saleStartDate" = NULL,
  "saleEndDate" = NULL,
  "isDefault" = EXCLUDED."isDefault",
  "isActive" = true,
  "updatedAt" = NOW();

UPDATE "products"
SET
  "title" = '123 Learning | Numbers 1-10',
  "slug" = '123-learning-numbers-1-10',
  "sku" = 'LI-123-001',
  "seoTitle" = 'Numbers 1-10 Printable Workbook for Kids | 123 Learning',
  "seoDescription" = 'Help young learners recognise, trace, write and count numbers 1 to 10 with this fun printable workbook for preschool and kindergarten children.',
  "seoKeywords" = ARRAY[
    'numbers 1-10 workbook',
    'numbers 1-10 printable',
    'numbers worksheets for kids',
    'number tracing worksheets',
    'number writing practice',
    'counting worksheets',
    'counting activities for kids',
    'preschool math workbook',
    'kindergarten math activities',
    'early math printable',
    'number recognition activities',
    'number names for kids',
    'preschool printable workbook',
    'homeschool math activities',
    'early learning printable'
  ]::TEXT[]
WHERE "slug" = '123-learning-numbers-1-10'
   OR "sku" = 'LI-123-001'
   OR "title" = '123 Learning | Numbers 1-10';

UPDATE "products"
SET
  "title" = 'ABC Learning',
  "slug" = 'abc-learning',
  "sku" = 'LI-ABC-001',
  "seoTitle" = 'ABC Learning Printable Workbook | A-Z Alphabet for Kids',
  "seoDescription" = 'Help children learn the alphabet with this printable A-Z workbook featuring letter recognition, phonics, tracing, vocabulary and fun activities for ages 3-6.',
  "seoKeywords" = ARRAY[
    'ABC workbook',
    'alphabet workbook',
    'alphabet printable',
    'A-Z worksheets',
    'letter tracing',
    'phonics workbook',
    'letter recognition',
    'preschool alphabet',
    'kindergarten alphabet',
    'alphabet activities',
    'early literacy',
    'printable alphabet workbook',
    'homeschool alphabet',
    'English alphabet for kids',
    'alphabet tracing worksheets'
  ]::TEXT[]
WHERE "slug" = 'abc-learning'
   OR "sku" = 'LI-ABC-001'
   OR "title" = 'ABC Learning';
