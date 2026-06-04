-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'TRANSFER', 'CARD', 'WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Governorate" AS ENUM ('BAGHDAD', 'BASRA', 'NINEVEH', 'ERBIL', 'SULAYMANIYAH', 'DUHOK', 'KIRKUK', 'NAJAF', 'KARBALA', 'BABYLON', 'WASIT', 'MAYSAN', 'DHI_QAR', 'MUTHANNA', 'QADISIYYAH', 'DIYALA', 'ANBAR', 'SALADIN', 'HALABJA');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('BAGHDAD', 'ABU_GHRAIB', 'MAHMUDIYAH', 'TARMIYAH', 'SADR_CITY', 'BASRA', 'ZUBAIR', 'ABU_AL_KHASIB', 'QURNA', 'FAW', 'MOSUL', 'TAL_AFAR', 'SINJAR', 'HAMDANIYA', 'SHEIKHAN', 'ERBIL', 'SHAQLAWA', 'KOYA', 'SORAN', 'CHOMAN', 'SULAYMANIYAH', 'RANIA', 'CHAMCHAMAL', 'KALAR', 'DUKAN', 'DUHOK', 'ZAKHO', 'AMEDI', 'SEMEL', 'AKRE', 'KIRKUK', 'HAWIJA', 'DAQUQ', 'DIBIS', 'NAJAF', 'KUFA', 'MISHKHAB', 'MANATHERA', 'KARBALA', 'AIN_AL_TAMR', 'HINDIYA', 'HILLAH', 'MUSAYYIB', 'MAHAWIL', 'HASHIMIYA', 'KUT', 'SUWAIRA', 'NUMANIYA', 'AZIZIYA', 'BADRA', 'AMARAH', 'MAJAR_AL_KABIR', 'ALI_AL_GHARBI', 'QALAT_SALIH', 'NASIRIYAH', 'SHATRA', 'RIFAI', 'SUQ_AL_SHUYUKH', 'CHIBAYISH', 'SAMAWAH', 'RUMAITHA', 'KHIDHIR', 'SALMAN', 'DIWANIYAH', 'AFAK', 'SHAMIYA', 'HAMZA', 'BAQUBAH', 'MUQDADIYAH', 'KHALIS', 'KHANAQIN', 'BALADRUZ', 'RAMADI', 'FALLUJAH', 'HIT', 'HADITHA', 'QAIM', 'RUTBA', 'TIKRIT', 'SAMARRA', 'BALAD', 'DUJAIL', 'SHIRQAT', 'BAIJI', 'HALABJA', 'KHURMAL', 'SAYID_SADIQ', 'BIYARA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shipCity" "City",
ADD COLUMN     "shipDistrict" TEXT,
ADD COLUMN     "shipGovernorate" "Governorate",
ADD COLUMN     "shipLandmark" TEXT,
ADD COLUMN     "shipName" TEXT,
ADD COLUMN     "shipPhone" TEXT,
ADD COLUMN     "shipStreet" TEXT;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT,
    "governorate" "Governorate" NOT NULL,
    "city" "City" NOT NULL,
    "district" TEXT,
    "street" TEXT,
    "nearestLandmark" TEXT,
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
