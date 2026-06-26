-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL', 'SINGLE');

-- AlterEnum
ALTER TYPE "CustomerNotificationType" ADD VALUE 'ANNOUNCEMENT';

-- AlterTable
ALTER TABLE "CustomerNotification" ADD COLUMN     "announcementId" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleCkb" TEXT,
    "bodyEn" TEXT NOT NULL,
    "bodyAr" TEXT,
    "bodyCkb" TEXT,
    "imageUrl" TEXT,
    "targetType" "HomeTargetType" NOT NULL DEFAULT 'NONE',
    "targetId" TEXT,
    "url" TEXT,
    "audience" "AnnouncementAudience" NOT NULL DEFAULT 'ALL',
    "customerId" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- AddForeignKey
ALTER TABLE "CustomerNotification" ADD CONSTRAINT "CustomerNotification_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
