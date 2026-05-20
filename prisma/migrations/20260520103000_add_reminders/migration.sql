-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('BUYER_PAYMENT', 'SELLER_PAYMENT', 'MONTH_CLOSE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'DONE', 'DISMISSED');

-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "dairyId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "targetUserId" INTEGER,
    "targetUserRole" "Role",
    "type" "ReminderType" NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "message" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_dairyId_status_dueDate_idx" ON "Reminder"("dairyId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Reminder_targetUserId_status_idx" ON "Reminder"("targetUserId", "status");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_dairyId_fkey" FOREIGN KEY ("dairyId") REFERENCES "Dairy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
