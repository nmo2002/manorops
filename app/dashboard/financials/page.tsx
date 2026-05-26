import { prisma } from "@/lib/prisma";
import { FinancialsClient } from "./financials-client";

export default async function FinancialsPage() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const [properties, expenses, vendors] = await Promise.all([
    prisma.property.findMany({
      select: {
        id: true,
        name: true,
        annualBudget: true,
        tasks: {
          where: { status: "COMPLETED", actualCost: { not: null } },
          select: { actualCost: true, updatedAt: true },
        },
        expenses: {
          select: { amount: true, category: true, date: true },
        },
        assets: {
          select: { estimatedValue: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: {
        property: { select: { id: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
      },
    }),
    prisma.vendor.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  // YTD task spend (actualCost on completed tasks this year)
  const ytdTaskSpend = properties.reduce((sum, p) => {
    return (
      sum +
      p.tasks
        .filter((t) => t.updatedAt >= startOfYear)
        .reduce((s, t) => s + (t.actualCost ?? 0), 0)
    );
  }, 0);

  // YTD expense spend
  const ytdExpenseSpend = expenses
    .filter((e) => e.date >= startOfYear)
    .reduce((s, e) => s + e.amount, 0);

  const ytdTotalSpend = ytdTaskSpend + ytdExpenseSpend;

  // Total annual budget
  const totalBudget = properties.reduce((s, p) => s + (p.annualBudget ?? 0), 0);

  // Total portfolio asset value
  const portfolioValue = properties.reduce(
    (s, p) => s + p.assets.reduce((as, a) => as + (a.estimatedValue ?? 0), 0),
    0
  );

  // Per-property breakdown
  const propertyBreakdown = properties.map((p) => {
    const taskSpend = p.tasks
      .filter((t) => t.updatedAt >= startOfYear)
      .reduce((s, t) => s + (t.actualCost ?? 0), 0);
    const expenseSpend = p.expenses
      .filter((e) => e.date >= startOfYear)
      .reduce((s, e) => s + e.amount, 0);
    const totalSpend = taskSpend + expenseSpend;
    const assetValue = p.assets.reduce((s, a) => s + (a.estimatedValue ?? 0), 0);
    return {
      id: p.id,
      name: p.name,
      annualBudget: p.annualBudget,
      ytdSpend: totalSpend,
      assetValue,
    };
  });

  // Spend by category (expenses only)
  const categorySpend: Record<string, number> = {};
  expenses
    .filter((e) => e.date >= startOfYear)
    .forEach((e) => {
      categorySpend[e.category] = (categorySpend[e.category] ?? 0) + e.amount;
    });

  return (
    <FinancialsClient
      ytdTotalSpend={ytdTotalSpend}
      totalBudget={totalBudget}
      portfolioValue={portfolioValue}
      propertyBreakdown={propertyBreakdown}
      categorySpend={categorySpend}
      expenses={expenses}
      properties={properties.map((p) => ({ id: p.id, name: p.name }))}
      vendors={vendors}
    />
  );
}
