-- Brands are retired; Store now plays the brand role. Drop the product FK column
-- (its index + FK constraint go with it) and the Brand table.
ALTER TABLE "Product" DROP COLUMN "brandId";
DROP TABLE "Brand";
