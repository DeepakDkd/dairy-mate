/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `MilkEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('BUYER', 'SELLER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('MILK_ENTRY', 'PAYMENT');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- AlterTable
ALTER TABLE "MilkEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "balanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "customerType" "CustomerType" NOT NULL DEFAULT 'BUYER',
ADD COLUMN     "note" TEXT;

-- DropTable
DROP TABLE "public"."Account";

-- CreateTable
CREATE TABLE "CustomerTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "milkQuantity" DOUBLE PRECISION,
    "ratePerLitre" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION DEFAULT 0,
    "paidAmount" DOUBLE PRECISION DEFAULT 0,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'MILK_ENTRY',
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerTransaction_customerId_date_idx" ON "CustomerTransaction"("customerId", "date");

-- CreateIndex
CREATE INDEX "MilkEntry_customerId_date_idx" ON "MilkEntry"("customerId", "date");

-- AddForeignKey
ALTER TABLE "CustomerTransaction" ADD CONSTRAINT "CustomerTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
