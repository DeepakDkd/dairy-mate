/*
  Warnings:

  - You are about to drop the column `eveningLtrs` on the `BuyerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `morningLtrs` on the `BuyerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `eveningLtrs` on the `SellerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `morningLtrs` on the `SellerEntry` table. All the data in the column will be lost.
  - You are about to drop the `FatRate` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MORNING', 'EVENING');

-- CreateEnum
CREATE TYPE "MilkType" AS ENUM ('COW', 'BUFFALO');

-- DropForeignKey
ALTER TABLE "public"."FatRate" DROP CONSTRAINT "FatRate_dairyId_fkey";

-- AlterTable
ALTER TABLE "BuyerEntry" DROP COLUMN "eveningLtrs",
DROP COLUMN "morningLtrs",
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "litres" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shift" "Shift" NOT NULL DEFAULT 'MORNING';

-- AlterTable
ALTER TABLE "SellerEntry" DROP COLUMN "eveningLtrs",
DROP COLUMN "morningLtrs",
ADD COLUMN     "litres" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lr" DOUBLE PRECISION NOT NULL DEFAULT 26,
ADD COLUMN     "milkType" "MilkType" NOT NULL DEFAULT 'COW',
ADD COLUMN     "shift" "Shift" NOT NULL DEFAULT 'MORNING';

-- DropTable
DROP TABLE "public"."FatRate";

-- CreateTable
CREATE TABLE "MilkRate" (
    "id" SERIAL NOT NULL,
    "dairyId" INTEGER NOT NULL,
    "milkType" "MilkType" NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "lr" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MilkRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MilkRate" ADD CONSTRAINT "MilkRate_dairyId_fkey" FOREIGN KEY ("dairyId") REFERENCES "Dairy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
