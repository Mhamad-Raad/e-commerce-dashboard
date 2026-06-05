-- AlterEnum
ALTER TYPE "OrderEventType" ADD VALUE 'STOCK_RESERVED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stockReserved" BOOLEAN NOT NULL DEFAULT false;
