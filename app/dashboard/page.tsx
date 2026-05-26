import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Wrench, Users, FileText, Package, RefreshCw, TrendingUp } from "lucide-react";
import { format, addDays, differenceInDays, isPast } from "date-fns";
import Link from "next/link";
import { RemindersWidget } from "@/components/dashboard/reminders-widget";

type UpcomingTask = {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: string;
  status: string;
  isRecurring: boolean;
  recurrenceFrequency: string | null;
  property: { name: string } | null;
  vendor: { companyName: string } | null;
};

type ExpiringDoc = {
  id: string;
  title: string;
  category: string;
  expirationDate: Date | null;
  property: { name: string } | null;
};

type UpcomingReminder = {
  id: string;
  message: string;
  remindAt: Date;
  task: { title: string } | null;
  document: { title: string } | null;
  asset: { itemName: string } | null;
  property: { name: string } | null;
};

async function getDashboardData() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

  const [propertyCount, openTasks, vendors, documents, assets, upcomingTasks, expiringDocs, reminders, ytdExpenses, completedTasksYTD, totalBudget, propertyList, rawMonthlyExpenses] =
    await Promise.all([
      prisma.property.count(),
      prisma.maintenanceTask.count({
        where: { status: { in: ["PENDING", "SCHEDULED", "IN_PROGRESS"] } },
      }),
      prisma.vendor.count({ where: { status: "ACTIVE" } }),
      prisma.document.count(),
      prisma.asset.count(),
      prisma.maintenanceTask.findMany({
        where: { status: { in: ["PENDING", "SCHEDULED"] } },
        orderBy: { dueDate: "asc" },
        take: 6,
        include: {
          property: { select: { name: true } },
          vendor: { select: { companyName: true } },
        },
      }),
      prisma.document.findMany({
        where: {
          expirationDate: { lte: addDays(new Date(), 90), gte: new Date() },
        },
        orderBy: { expirationDate: "asc" },
        take: 5,
        include: { property: { select: { name: true } } },
      }),
      prisma.reminder.findMany({
        where: {
          isDismissed: false,
          remindAt: { lte: addDays(new Date(), 14) },
        },
        orderBy: { remindAt: "asc" },
        take: 5,
        include: {
          task: { select: { title: true } },
          document: { select: { title: true } },
          asset: { select: { itemName: true } },
          property: { select: { name: true } },
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfYear } },
      }),
      prisma.maintenanceTask.aggregate({
        _sum: { actualCost: true },
        where: { status: "COMPLETED", updatedAt: { gte: startOfYear }, actualCost: { not: null } },
      }),
      prisma.property.aggregate({ _sum: { annualBudget: true } }),
      prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.expense.findMany({
        where: { date: { gte: sixMonthsAgo } },
        select: { amount: true, date: true },
      }),
    ]);

  const ytdSpend = (ytdExpenses._sum.amount ?? 0) + (completedTasksYTD._sum.actualCost ?? 0);
  const annualBudget = totalBudget._sum.annualBudget ?? 0;

  const monthlySpend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
    const amount = rawMonthlyExpenses
      .filter((e) => {
        const ed = new Date(e.date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      })
      .reduce((sum, e) => sum + e.amount, 0);
    return { label: format(d, "MMM"), amount, isCurrent: i === 5 };
  });

  return { properties: propertyCount, openTasks, vendors, documents, assets, upcomingTasks, expiringDocs, reminders, ytdSpend, annualBudget, propertyList, monthlySpend };
}

const priorityColors: Record<string, string> = {
  LOW: "bg-stone-100 text-stone-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-amber-50 text-amber-700",
  URGENT: "bg-red-50 text-red-700",
};

const categoryLabel: Record<string, string> = {
  INSURANCE: "Insurance",
  WARRANTY: "Warranty",
  CONTRACT: "Contract",
  DEED: "Deed",
  TAX: "Tax",
  OTHER: "Other",
};

function fmtChartAmount(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

function getGreeting(name: string | null | undefined) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const first = name?.split(" ")[0] ?? "there";
  return `Good ${time}, ${first}`;
}

export default async function DashboardPage() {
  const [session, data] = await Promise.all([auth(), getDashboardData()]);
  const { properties, openTasks, vendors, documents, assets, upcomingTasks, expiringDocs, reminders, ytdSpend, annualBudget, propertyList, monthlySpend } = data;

  const budgetPct = annualBudget > 0 ? Math.min((ytdSpend / annualBudget) * 100, 100) : null;

  const overviewCards = [
    { label: "Properties", value: properties, icon: Building2, href: "/dashboard/properties", color: "bg-stone-900 text-white" },
    { label: "Open Tasks", value: openTasks, icon: Wrench, href: "/dashboard/maintenance", color: "bg-amber-50 text-amber-700" },
    { label: "Active Vendors", value: vendors, icon: Users, href: "/dashboard/vendors", color: "bg-blue-50 text-blue-700" },
    { label: "Documents", value: documents, icon: FileText, href: "/dashboard/documents", color: "bg-violet-50 text-violet-700" },
    { label: "Inventory Items", value: assets, icon: Package, href: "/dashboard/inventory", color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">{getGreeting(session?.user?.name)}</h1>
        <p className="text-sm text-stone-400 mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {overviewCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer border-stone-200 hover:border-stone-300 group">
              <CardContent className="p-5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-stone-900">{card.value}</div>
                <div className="text-xs text-stone-500 mt-0.5 font-medium">{card.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Financial snapshot */}
      <Link href="/dashboard/financials" className="block">
        <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <span className="text-sm font-semibold text-stone-900">Financial Snapshot</span>
            </div>
            <span className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors">View financials →</span>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-2xl font-bold text-stone-900">
                ${ytdSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">{new Date().getFullYear()} YTD spend</div>
            </div>
            {annualBudget > 0 && budgetPct !== null && (
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-400">Budget utilization</span>
                  <span className={budgetPct >= 90 ? "text-red-600 font-medium" : budgetPct >= 70 ? "text-amber-600 font-medium" : "text-stone-500"}>
                    {budgetPct.toFixed(0)}% of ${annualBudget.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${budgetPct >= 90 ? "bg-red-500" : budgetPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Monthly Spend Chart */}
      <Card className="border-stone-200">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-stone-900">Monthly Spend</CardTitle>
            <span className="text-xs text-stone-400">Last 6 months · expenses</span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {monthlySpend.every((m) => m.amount === 0) ? (
            <div className="flex items-end gap-2">
              {monthlySpend.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t-sm bg-stone-100" style={{ height: "4px" }} />
                  <span className="text-[10px] text-stone-400">{m.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-2">
              {(() => {
                const maxAmount = Math.max(...monthlySpend.map((m) => m.amount), 1);
                return monthlySpend.map((m, i) => {
                  const barHeight = Math.max(Math.round((m.amount / maxAmount) * 88), m.amount > 0 ? 6 : 2);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium text-stone-500 leading-none" style={{ visibility: m.amount > 0 ? "visible" : "hidden" }}>
                        {fmtChartAmount(m.amount)}
                      </span>
                      <div
                        className={`w-full rounded-t-sm transition-colors ${m.isCurrent ? "bg-stone-800" : "bg-stone-200"}`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className={`text-[10px] leading-none ${m.isCurrent ? "text-stone-700 font-medium" : "text-stone-400"}`}>
                        {m.label}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upcoming maintenance */}
        <Card className="border-stone-200">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-stone-900">Upcoming Maintenance</CardTitle>
              <Link href="/dashboard/maintenance" className="text-xs text-stone-400 hover:text-stone-700 transition-colors font-medium">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingTasks.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Wrench className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No upcoming tasks</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {(upcomingTasks as UpcomingTask[]).map((task) => {
                  const overdue = task.dueDate && isPast(task.dueDate);
                  const daysUntil = task.dueDate ? differenceInDays(task.dueDate, new Date()) : null;
                  return (
                    <div key={task.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {task.isRecurring && (
                            <RefreshCw className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-stone-900 truncate">{task.title}</span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5 truncate">
                          {task.property?.name ?? "No property"}
                          {task.vendor ? ` · ${task.vendor.companyName}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={`text-xs font-medium ${overdue ? "text-red-500" : daysUntil !== null && daysUntil <= 3 ? "text-amber-600" : "text-stone-400"}`}>
                            {overdue ? "Overdue" : daysUntil === 0 ? "Today" : `${daysUntil}d`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring documents */}
        <Card className="border-stone-200">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-stone-900">Documents Expiring Soon</CardTitle>
              <Link href="/dashboard/documents" className="text-xs text-stone-400 hover:text-stone-700 transition-colors font-medium">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expiringDocs.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <FileText className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No documents expiring within 90 days</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {(expiringDocs as ExpiringDoc[]).map((doc) => {
                  const daysLeft = doc.expirationDate ? differenceInDays(doc.expirationDate, new Date()) : null;
                  const urgent = daysLeft !== null && daysLeft <= 30;
                  return (
                    <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-900 truncate">{doc.title}</div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {doc.property?.name ?? "No property"} · {categoryLabel[doc.category] ?? doc.category}
                        </div>
                      </div>
                      {doc.expirationDate && (
                        <div className="shrink-0 text-right">
                          <div className={`text-xs font-semibold ${urgent ? "text-amber-600" : "text-stone-500"}`}>
                            {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                          </div>
                          <div className="text-xs text-stone-400">{format(doc.expirationDate, "MMM d, yyyy")}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reminders */}
      <RemindersWidget reminders={reminders as UpcomingReminder[]} properties={propertyList} />
    </div>
  );
}
