import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding financial data...");

  const hamptons = await prisma.property.findFirst({ where: { name: "The Hamptons Estate" } });
  const aspen = await prisma.property.findFirst({ where: { name: "Aspen Mountain Lodge" } });
  const palmBeach = await prisma.property.findFirst({ where: { name: "Palm Beach Residence" } });
  const eliteHVAC = await prisma.vendor.findFirst({ where: { companyName: "Elite Climate Systems" } });
  const premierePool = await prisma.vendor.findFirst({ where: { companyName: "Premiere Pool & Spa" } });
  const southernSecurity = await prisma.vendor.findFirst({ where: { companyName: "Southern Shield Security" } });

  if (!hamptons || !aspen || !palmBeach) throw new Error("Properties not found");

  // Set annual budgets
  await prisma.property.update({ where: { id: hamptons.id }, data: { annualBudget: 120000 } });
  await prisma.property.update({ where: { id: aspen.id }, data: { annualBudget: 60000 } });
  await prisma.property.update({ where: { id: palmBeach.id }, data: { annualBudget: 75000 } });
  console.log("✓ Annual budgets set");

  // Add actual costs to existing completed tasks
  const completedTasks = await prisma.maintenanceTask.findMany({
    where: { status: "COMPLETED" },
  });
  for (const task of completedTasks) {
    await prisma.maintenanceTask.update({
      where: { id: task.id },
      data: { estimatedCost: 3800, actualCost: 3500 },
    });
  }
  console.log(`✓ Cost data added to ${completedTasks.length} completed tasks`);

  // Seed realistic expenses (YTD 2026)
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

  await prisma.expense.createMany({
    skipDuplicates: true,
    data: [
      // Hamptons — utilities
      { description: "PSEG Long Island — January electricity", amount: 2840, category: "UTILITIES", date: daysAgo(140), propertyId: hamptons.id, notes: "Account #4421-8872. High due to heated pool." },
      { description: "PSEG Long Island — February electricity", amount: 2610, category: "UTILITIES", date: daysAgo(110), propertyId: hamptons.id },
      { description: "PSEG Long Island — March electricity", amount: 2290, category: "UTILITIES", date: daysAgo(80), propertyId: hamptons.id },
      { description: "PSEG Long Island — April electricity", amount: 1980, category: "UTILITIES", date: daysAgo(50), propertyId: hamptons.id },
      { description: "National Grid — gas service Q1", amount: 1440, category: "UTILITIES", date: daysAgo(100), propertyId: hamptons.id },
      // Hamptons — staffing
      { description: "Margaret Collins — estate manager salary Q1", amount: 22500, category: "STAFFING", date: daysAgo(95), propertyId: hamptons.id, notes: "Q1 2026 salary payment." },
      { description: "Margaret Collins — estate manager salary Q2 partial", amount: 7500, category: "STAFFING", date: daysAgo(30), propertyId: hamptons.id },
      // Hamptons — landscaping
      { description: "Hargrove Grounds & Gardens — March service", amount: 3800, category: "LANDSCAPING", date: daysAgo(72), propertyId: hamptons.id },
      { description: "Hargrove Grounds & Gardens — April service", amount: 4200, category: "LANDSCAPING", date: daysAgo(42), propertyId: hamptons.id, notes: "Includes spring planting and lawn aeration." },
      { description: "Hargrove Grounds & Gardens — May service", amount: 4200, category: "LANDSCAPING", date: daysAgo(12), propertyId: hamptons.id },
      // Hamptons — insurance
      { description: "AIG Private Client — homeowner's insurance premium", amount: 48200, category: "INSURANCE", date: daysAgo(150), propertyId: hamptons.id, notes: "Annual premium. Policy #HGE-2024-001." },
      // Hamptons — maintenance
      { description: "Elite Climate Systems — HVAC seasonal service", amount: 4800, category: "MAINTENANCE", date: daysAgo(60), propertyId: hamptons.id, vendorId: eliteHVAC?.id },
      { description: "Premiere Pool & Spa — pool opening service", amount: 2200, category: "MAINTENANCE", date: daysAgo(45), propertyId: hamptons.id, vendorId: premierePool?.id },
      { description: "Supplies — cleaning products & household consumables", amount: 680, category: "SUPPLIES", date: daysAgo(25), propertyId: hamptons.id },
      // Aspen — utilities & maintenance
      { description: "Holy Cross Electric — winter electricity", amount: 3200, category: "UTILITIES", date: daysAgo(120), propertyId: aspen.id, notes: "High usage — radiant heating system." },
      { description: "Alpine Ridge Builders — boiler service", amount: 1800, category: "MAINTENANCE", date: daysAgo(90), propertyId: aspen.id },
      { description: "Aspen caretaker services — Q1", amount: 9000, category: "STAFFING", date: daysAgo(85), propertyId: aspen.id, notes: "Dave Ritchie retainer + on-call hours." },
      { description: "Snowmelt system maintenance", amount: 950, category: "MAINTENANCE", date: daysAgo(115), propertyId: aspen.id },
      { description: "Property insurance — Aspen lodge", amount: 18400, category: "INSURANCE", date: daysAgo(130), propertyId: aspen.id },
      // Palm Beach — security, utilities, HOA
      { description: "Southern Shield Security — monthly monitoring Q1", amount: 2700, category: "SECURITY", date: daysAgo(100), propertyId: palmBeach.id, vendorId: southernSecurity?.id, notes: "3 months @ $900/mo. Contract #PB-SS-2024." },
      { description: "Southern Shield Security — April monitoring", amount: 900, category: "SECURITY", date: daysAgo(55), propertyId: palmBeach.id, vendorId: southernSecurity?.id },
      { description: "Florida Power & Light — Q1 electricity", amount: 4800, category: "UTILITIES", date: daysAgo(90), propertyId: palmBeach.id },
      { description: "Palm Beach HOA fees — Q1", amount: 3600, category: "HOA_FEES", date: daysAgo(110), propertyId: palmBeach.id, notes: "Q1 2026. Annual total: $14,400." },
      { description: "Palm Beach HOA fees — Q2", amount: 3600, category: "HOA_FEES", date: daysAgo(20), propertyId: palmBeach.id },
      { description: "Property tax installment — Palm Beach", amount: 12800, category: "TAXES", date: daysAgo(135), propertyId: palmBeach.id, notes: "First installment of annual property tax." },
      { description: "Sylvia Torres — household manager Q1", amount: 15000, category: "STAFFING", date: daysAgo(88), propertyId: palmBeach.id },
    ],
  });
  console.log("✓ Expense records created");

  console.log("Financial seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
