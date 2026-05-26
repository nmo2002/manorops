-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MAINTENANCE', 'UTILITIES', 'INSURANCE', 'STAFFING', 'LANDSCAPING', 'SECURITY', 'SUPPLIES', 'HOA_FEES', 'TAXES', 'OTHER');

-- AlterTable
ALTER TABLE "MaintenanceTask" ADD COLUMN     "actualCost" DOUBLE PRECISION,
ADD COLUMN     "estimatedCost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "annualBudget" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "propertyId" TEXT,
    "vendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
