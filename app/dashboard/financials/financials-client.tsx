"use client";

import { useState } from "react";
import { Plus, TrendingUp, Pencil, Trash2, DollarSign, PiggyBank, BarChart3, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createExpense, updateExpense, deleteExpense } from "@/app/actions/expenses";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  notes: string | null;
  propertyId: string | null;
  vendorId: string | null;
  property: { id: string; name: string } | null;
  vendor: { id: string; companyName: string } | null;
};

type PropertyBreakdown = {
  id: string;
  name: string;
  annualBudget: number | null;
  ytdSpend: number;
  assetValue: number;
};

const categories = [
  "MAINTENANCE", "UTILITIES", "INSURANCE", "STAFFING",
  "LANDSCAPING", "SECURITY", "SUPPLIES", "HOA_FEES", "TAXES", "OTHER",
];

const categoryLabels: Record<string, string> = {
  MAINTENANCE: "Maintenance",
  UTILITIES: "Utilities",
  INSURANCE: "Insurance",
  STAFFING: "Staffing",
  LANDSCAPING: "Landscaping",
  SECURITY: "Security",
  SUPPLIES: "Supplies",
  HOA_FEES: "HOA Fees",
  TAXES: "Taxes",
  OTHER: "Other",
};

const categoryColors: Record<string, string> = {
  MAINTENANCE: "bg-amber-50 text-amber-700",
  UTILITIES: "bg-blue-50 text-blue-700",
  INSURANCE: "bg-violet-50 text-violet-700",
  STAFFING: "bg-emerald-50 text-emerald-700",
  LANDSCAPING: "bg-green-50 text-green-700",
  SECURITY: "bg-red-50 text-red-700",
  SUPPLIES: "bg-stone-100 text-stone-600",
  HOA_FEES: "bg-orange-50 text-orange-700",
  TAXES: "bg-pink-50 text-pink-700",
  OTHER: "bg-stone-100 text-stone-500",
};

const emptyForm = {
  description: "",
  amount: "",
  category: "OTHER",
  date: format(new Date(), "yyyy-MM-dd"),
  notes: "",
  propertyId: "",
  vendorId: "",
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function BudgetBar({ spent, budget }: { spent: number; budget: number | null }) {
  if (!budget) return <span className="text-xs text-stone-400 italic">No budget set</span>;
  const pct = Math.min((spent / budget) * 100, 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-stone-500">${fmt(spent)} spent</span>
        <span className={pct >= 90 ? "text-red-600 font-medium" : "text-stone-400"}>
          {pct.toFixed(0)}% of ${fmt(budget)}
        </span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function FinancialsClient({
  ytdTotalSpend,
  totalBudget,
  portfolioValue,
  propertyBreakdown,
  categorySpend,
  expenses,
  properties,
  vendors,
}: {
  ytdTotalSpend: number;
  totalBudget: number;
  portfolioValue: number;
  propertyBreakdown: PropertyBreakdown[];
  categorySpend: Record<string, number>;
  expenses: Expense[];
  properties: { id: string; name: string }[];
  vendors: { id: string; companyName: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [catFilter, setCatFilter] = useState("ALL");

  const budgetRemaining = totalBudget - ytdTotalSpend;
  const budgetPct = totalBudget > 0 ? (ytdTotalSpend / totalBudget) * 100 : 0;

  const filtered = expenses.filter((e) => catFilter === "ALL" || e.category === catFilter);

  const topCategories = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCatSpend = topCategories[0]?.[1] ?? 1;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setForm({
      description: e.description,
      amount: e.amount.toString(),
      category: e.category,
      date: format(new Date(e.date), "yyyy-MM-dd"),
      notes: e.notes ?? "",
      propertyId: e.propertyId ?? "",
      vendorId: e.vendorId ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        description: form.description,
        amount: form.amount,
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
        propertyId: form.propertyId || undefined,
        vendorId: form.vendorId || undefined,
      };
      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        await createExpense(payload);
      }
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await deleteExpense(id);
      setDeleteId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Financials</h1>
          <p className="text-sm text-stone-500 mt-1">{new Date().getFullYear()} year-to-date overview</p>
        </div>
        <Button onClick={openCreate} className="bg-stone-900 text-white hover:bg-stone-800">
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "YTD Total Spend",
            value: `$${fmt(ytdTotalSpend)}`,
            sub: "across all properties",
            icon: TrendingUp,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Annual Budget",
            value: totalBudget > 0 ? `$${fmt(totalBudget)}` : "—",
            sub: totalBudget > 0 ? `$${fmt(Math.max(budgetRemaining, 0))} remaining` : "No budgets set",
            icon: PiggyBank,
            color: budgetPct >= 90 ? "bg-red-50 text-red-700" : budgetPct >= 70 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Portfolio Value",
            value: `$${fmt(portfolioValue)}`,
            sub: "total insured asset value",
            icon: Building2,
            color: "bg-stone-100 text-stone-700",
          },
          {
            label: "Logged Expenses",
            value: expenses.length.toString(),
            sub: `${expenses.filter(e => new Date(e.date) >= new Date(new Date().getFullYear(), 0, 1)).length} this year`,
            icon: DollarSign,
            color: "bg-blue-50 text-blue-700",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-stone-200 rounded-xl p-5">
            <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-stone-900 tracking-tight">{card.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{card.label}</div>
            <div className="text-xs text-stone-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Property budgets + category breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Per-property budget */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Budget by Property</h2>
          <div className="space-y-5">
            {propertyBreakdown.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-stone-800">{p.name}</span>
                  {p.assetValue > 0 && (
                    <span className="text-xs text-stone-400">${fmt(p.assetValue)} assets</span>
                  )}
                </div>
                <BudgetBar spent={p.ytdSpend} budget={p.annualBudget} />
              </div>
            ))}
            {propertyBreakdown.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-4">No properties found</p>
            )}
          </div>
        </div>

        {/* Spend by category */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Spend by Category (YTD)</h2>
          {topCategories.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No expenses logged yet</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[cat]}`}>
                      {categoryLabels[cat]}
                    </span>
                    <span className="text-sm font-semibold text-stone-800">${fmt(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-400 rounded-full"
                      style={{ width: `${(amount / maxCatSpend) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-900">Expense Log</h2>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
            {["ALL", ...categories.slice(0, 4)].map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  catFilter === c ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {c === "ALL" ? "All" : categoryLabels[c]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-stone-200 rounded-xl py-16 text-center">
            <BarChart3 className="w-7 h-7 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-500">No expenses logged</p>
            <p className="text-xs text-stone-400 mt-1 mb-4">Track utilities, HOA fees, staff costs, and more</p>
            <Button onClick={openCreate} variant="outline" size="sm">Log Expense</Button>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-stone-100 bg-stone-50">
                  <TableHead className="text-xs font-medium text-stone-500">Description</TableHead>
                  <TableHead className="text-xs font-medium text-stone-500">Category</TableHead>
                  <TableHead className="text-xs font-medium text-stone-500">Property</TableHead>
                  <TableHead className="text-xs font-medium text-stone-500">Vendor</TableHead>
                  <TableHead className="text-xs font-medium text-stone-500">Date</TableHead>
                  <TableHead className="text-xs font-medium text-stone-500 text-right">Amount</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="border-stone-100 hover:bg-stone-50">
                    <TableCell>
                      <div className="font-medium text-sm text-stone-900">{e.description}</div>
                      {e.notes && (
                        <div className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-xs">{e.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[e.category]}`}>
                        {categoryLabels[e.category]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-stone-600">
                      {e.property?.name ?? <span className="text-stone-300 italic text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-stone-600">
                      {e.vendor?.companyName ?? <span className="text-stone-300 italic text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">{format(new Date(e.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-sm font-semibold text-stone-900 text-right">
                      ${fmt(e.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700" onClick={() => openEdit(e)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-red-500" onClick={() => setDeleteId(e.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Expense" : "Log Expense"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Description *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Monthly electricity bill" />
              </div>
              <div className="space-y-1.5">
                <Label>Amount ($) *</Label>
                <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? "OTHER" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Property</Label>
                <Select value={form.propertyId || "none"} onValueChange={(v) => setForm({ ...form, propertyId: v === "none" || v === null ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No property</SelectItem>
                    {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Vendor</Label>
                <Select value={form.vendorId || "none"} onValueChange={(v) => setForm({ ...form, vendorId: v === "none" || v === null ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No vendor</SelectItem>
                    {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Invoice #, account number, etc." rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.description || !form.amount || loading} className="bg-stone-900 text-white hover:bg-stone-800">
              {loading ? "Saving..." : editing ? "Save Changes" : "Log Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Expense?</DialogTitle></DialogHeader>
          <p className="text-sm text-stone-500">This will permanently remove this expense record.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
