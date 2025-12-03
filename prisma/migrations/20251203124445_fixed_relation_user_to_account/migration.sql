/*
  Warnings:

  - A unique constraint covering the columns `[email,dairyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,dairyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('MILK_COLLECTOR', 'SENIOR_MILK_COLLECTOR', 'MILK_TESTER', 'QUALITY_AUDITOR', 'MANAGER', 'HELPER');

-- DropIndex
DROP INDEX "public"."User_email_key";

-- DropIndex
DROP INDEX "public"."User_phone_key";

-- AlterTable
ALTER TABLE "StaffProfile" ADD COLUMN     "jobLeaveDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "profileUrl" TEXT,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" SERIAL NOT NULL,
    "dairyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastEntryId" INTEGER,
    "lastPaymentId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_userId_key" ON "AccountBalance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_dairyId_userId_key" ON "AccountBalance"("dairyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_dairyId_key" ON "User"("email", "dairyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_dairyId_key" ON "User"("phone", "dairyId");

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_dairyId_fkey" FOREIGN KEY ("dairyId") REFERENCES "Dairy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
