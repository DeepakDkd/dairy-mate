/*
  Warnings:

  - You are about to drop the column `shift` on the `StaffProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('FAT_LR', 'MAWA');

-- DropIndex
DROP INDEX "public"."User_phone_key";

-- AlterTable
ALTER TABLE "Dairy" ADD COLUMN     "mawaPricePerKg" DOUBLE PRECISION,
ADD COLUMN     "pricingMode" "PricingMode" NOT NULL DEFAULT 'FAT_LR';

-- AlterTable
ALTER TABLE "SellerEntry" ADD COLUMN     "mawaPerLitreGrams" DOUBLE PRECISION,
ADD COLUMN     "mawaTotalGrams" DOUBLE PRECISION,
ALTER COLUMN "fat" DROP NOT NULL,
ALTER COLUMN "lr" DROP NOT NULL,
ALTER COLUMN "lr" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StaffProfile" DROP COLUMN "shift";
