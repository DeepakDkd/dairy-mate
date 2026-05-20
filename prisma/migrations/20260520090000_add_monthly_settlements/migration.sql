-- CreateTable
CREATE TABLE "MonthlySettlement" (
    "id" SERIAL NOT NULL,
    "dairyId" INTEGER NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "monthKey" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT true,
    "closedAt" TIMESTAMP(3) NOT NULL,
    "reopenedAt" TIMESTAMP(3),
    "closedByUserId" INTEGER NOT NULL,
    "notes" TEXT,
    "buyerClosingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellerClosingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyBuyerAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlySellerAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySettlement_dairyId_monthStart_key" ON "MonthlySettlement"("dairyId", "monthStart");

-- CreateIndex
CREATE INDEX "MonthlySettlement_dairyId_monthKey_idx" ON "MonthlySettlement"("dairyId", "monthKey");

-- AddForeignKey
ALTER TABLE "MonthlySettlement" ADD CONSTRAINT "MonthlySettlement_dairyId_fkey" FOREIGN KEY ("dairyId") REFERENCES "Dairy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
