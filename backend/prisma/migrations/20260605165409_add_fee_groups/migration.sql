-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "feeGroupId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "feesCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "feesLabel" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "feeGroupId" TEXT;

-- CreateTable
CREATE TABLE "FeeGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "taxRatePct" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeGroup_isActive_idx" ON "FeeGroup"("isActive");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "FeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "FeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
