-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "attributeSchema" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "attributes" JSONB NOT NULL DEFAULT '{}';
