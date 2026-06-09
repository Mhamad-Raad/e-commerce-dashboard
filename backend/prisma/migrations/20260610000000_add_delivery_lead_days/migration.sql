-- Store-level default estimated-delivery window (in days).
ALTER TABLE "Store" ADD COLUMN "minLeadDays" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Store" ADD COLUMN "maxLeadDays" INTEGER NOT NULL DEFAULT 7;

-- Optional per-product override of the store's window (null = inherit).
ALTER TABLE "Product" ADD COLUMN "minLeadDays" INTEGER;
ALTER TABLE "Product" ADD COLUMN "maxLeadDays" INTEGER;
