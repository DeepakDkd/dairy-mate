/*
  Warnings:

  - You are about to drop the column `lastEntryId` on the `AccountBalance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccountBalance" DROP COLUMN "lastEntryId",
ADD COLUMN     "lastBuyerEntryId" INTEGER,
ADD COLUMN     "lastSellerEntryId" INTEGER;

-- CreateIndex
CREATE INDEX "BuyerEntry_dairyId_buyerId_date_idx" ON "BuyerEntry"("dairyId", "buyerId", "date");

-- CreateIndex
CREATE INDEX "Payment_dairyId_userId_date_idx" ON "Payment"("dairyId", "userId", "date");

-- CreateIndex
CREATE INDEX "SellerEntry_dairyId_sellerId_date_idx" ON "SellerEntry"("dairyId", "sellerId", "date");
