-- CreateEnum
CREATE TYPE "StaffShift" AS ENUM ('MORNING', 'EVENING', 'FULL_DAY');

-- AlterTable
ALTER TABLE "StaffProfile" ADD COLUMN     "shift" "StaffShift" NOT NULL DEFAULT 'FULL_DAY';

-- CreateIndex
CREATE INDEX "MilkRate_dairyId_milkType_fat_lr_idx" ON "MilkRate"("dairyId", "milkType", "fat", "lr");
