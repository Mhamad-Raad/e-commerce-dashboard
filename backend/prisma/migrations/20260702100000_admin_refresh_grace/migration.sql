-- AlterTable
ALTER TABLE "User" ADD COLUMN     "prevRefreshHash" TEXT,
ADD COLUMN     "refreshRotatedAt" TIMESTAMP(3);
