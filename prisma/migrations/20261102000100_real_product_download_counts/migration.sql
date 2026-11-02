-- Product.downloadCount held hand-set display numbers that real downloads
-- never touched. Reset it to the actual total of buyer downloads; the
-- download route keeps it in step from here on.
UPDATE "products" p
SET "downloadCount" = COALESCE(
  (SELECT SUM(d."downloadCount") FROM "downloads" d WHERE d."productId" = p."id"),
  0
);
