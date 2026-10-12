-- Colouring books are sold as the Black & White Printable PDF only.
-- For every book in the "coloring-books" category (or a subcategory of it):
--   * B&W is enabled and colour is disabled (colour prices are kept, unused),
--   * B&W uses the same PDF file as the colour PDF,
--   * B&W gets the same regional prices as the colour PDF.
-- Never overwrites a B&W PDF or B&W price that already exists. Past colour
-- purchases keep downloading the same file. Idempotent.

UPDATE "products" AS p
SET "bwPdfEnabled" = true,
    "colourPdfEnabled" = false,
    "bwPrivatePdfPath" = COALESCE(p."bwPrivatePdfPath", p."privatePdfPath"),
    "bwPdfFileName" = CASE WHEN p."bwPrivatePdfPath" IS NULL THEN p."pdfFileName" ELSE p."bwPdfFileName" END,
    "bwPdfFileSize" = CASE WHEN p."bwPrivatePdfPath" IS NULL THEN p."pdfFileSize" ELSE p."bwPdfFileSize" END
WHERE p."id" IN (
  SELECT pc."productId"
  FROM "product_categories" pc
  JOIN "categories" c ON c."id" = pc."categoryId"
  LEFT JOIN "categories" parent ON parent."id" = c."parentId"
  WHERE c."slug" = 'coloring-books' OR parent."slug" = 'coloring-books'
);

INSERT INTO "product_prices" (
  "id", "productId", "format", "pricingRegion", "countryCode", "currencyCode",
  "regularPrice", "salePrice", "saleStartDate", "saleEndDate", "isDefault", "isActive",
  "createdAt", "updatedAt"
)
SELECT
  'bw_' || pp."id", pp."productId", 'BW_PDF', pp."pricingRegion", pp."countryCode", pp."currencyCode",
  pp."regularPrice", pp."salePrice", pp."saleStartDate", pp."saleEndDate", pp."isDefault", pp."isActive",
  now(), now()
FROM "product_prices" pp
WHERE pp."format" = 'COLOUR_PDF'
  AND pp."productId" IN (
    SELECT pc."productId"
    FROM "product_categories" pc
    JOIN "categories" c ON c."id" = pc."categoryId"
    LEFT JOIN "categories" parent ON parent."id" = c."parentId"
    WHERE c."slug" = 'coloring-books' OR parent."slug" = 'coloring-books'
  )
ON CONFLICT ("productId", "format", "currencyCode") DO NOTHING;
