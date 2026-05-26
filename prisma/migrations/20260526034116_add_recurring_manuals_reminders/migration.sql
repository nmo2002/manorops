-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'CUSTOM');

-- AlterTable
ALTER TABLE "MaintenanceTask" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastCompletedAt" TIMESTAMP(3),
ADD COLUMN     "nextDueDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceFrequency" "RecurrenceFrequency",
ADD COLUMN     "recurrenceInterval" INTEGER;

-- CreateTable
CREATE TABLE "OperatingManual" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "accessInstructions" TEXT,
    "utilityShutoffs" TEXT,
    "wifiNetwork" TEXT,
    "wifiPassword" TEXT,
    "securityNotes" TEXT,
    "alarmCode" TEXT,
    "emergencyContacts" TEXT,
    "trashSchedule" TEXT,
    "houseRules" TEXT,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatingManual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT,
    "documentId" TEXT,
    "assetId" TEXT,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperatingManual_propertyId_key" ON "OperatingManual"("propertyId");

-- AddForeignKey
ALTER TABLE "OperatingManual" ADD CONSTRAINT "OperatingManual_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaintenanceTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
