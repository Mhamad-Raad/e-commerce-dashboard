-- CreateEnum
CREATE TYPE "CustomerNotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_STATUS_CHANGED');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateTable
CREATE TABLE "CustomerDevice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNotification" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "CustomerNotificationType" NOT NULL,
    "data" JSONB NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDevice_token_key" ON "CustomerDevice"("token");

-- CreateIndex
CREATE INDEX "CustomerDevice_customerId_idx" ON "CustomerDevice"("customerId");

-- CreateIndex
CREATE INDEX "CustomerNotification_customerId_createdAt_idx" ON "CustomerNotification"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerNotification_customerId_isRead_idx" ON "CustomerNotification"("customerId", "isRead");

-- AddForeignKey
ALTER TABLE "CustomerDevice" ADD CONSTRAINT "CustomerDevice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNotification" ADD CONSTRAINT "CustomerNotification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
