-- CreateEnum
CREATE TYPE "OrderEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'STOCK_RESTORED', 'TRACKING_UPDATED', 'NOTE_UPDATED', 'PAYMENT_RECORDED', 'PAYMENT_UPDATED', 'PAYMENT_REMOVED');

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderEventType" NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderEvent_orderId_idx" ON "OrderEvent"("orderId");

-- CreateIndex
CREATE INDEX "OrderEvent_createdAt_idx" ON "OrderEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
