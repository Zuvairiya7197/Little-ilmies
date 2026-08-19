ALTER TABLE "products"
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "products"
SET
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
  ]::TEXT[]
WHERE "slug" = 'asma-ul-husna-99-names-of-allah';

UPDATE "products"
SET
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
WHERE "slug" = '123-learning-numbers-1-10';

UPDATE "products"
SET
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
WHERE "slug" = 'abc-learning';
