-- Allow unauthenticated "guest" assistant trials: a Conversation now belongs
-- either to a signed-in customer (customerId) or to a guest device
-- (guestDeviceId, customerId null). Existing rows keep their customerId.

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "customerId" DROP NOT NULL;
ALTER TABLE "Conversation" ADD COLUMN "guestDeviceId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_guestDeviceId_idx" ON "Conversation"("guestDeviceId");
