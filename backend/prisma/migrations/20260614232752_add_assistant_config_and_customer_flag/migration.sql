-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "assistantEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "AssistantConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'anthropic',
    "model" TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
    "maxMsgsPerMinute" INTEGER,
    "maxMsgsPerHour" INTEGER,
    "maxMsgsPerDay" INTEGER,
    "maxMsgsPerWeek" INTEGER,
    "maxMsgsPerMonth" INTEGER,
    "maxTokensPerDay" INTEGER,
    "maxTokensPerWeek" INTEGER,
    "maxTokensPerMonth" INTEGER,
    "budgetWeeklyCents" INTEGER,
    "budgetMonthlyCents" INTEGER,
    "budgetTotalCents" INTEGER,
    "warnThresholdPct" INTEGER NOT NULL DEFAULT 80,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantConfig_pkey" PRIMARY KEY ("id")
);
