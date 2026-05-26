"use client";

import { useState } from "react";
import { Plus, Wrench, Pencil, Trash2, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
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
import { createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask, completeMaintenanceTask } from "@/app/actions/maintenance";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
  isRecurring: boolean;
  recurrenceFrequency: string | null;
  recurrenceInterval: number | null;
  nextDueDate: Date | null;
  estimatedCost: number | null;
  actualCost: number | null;
  propertyId: string | null;
  vendorId: string | null;
  property: { id: string; name: string } | null;
  vendor: { id: string; companyName: string } | null;
};

type Property = { id: string; name: string };
type Vendor = { id: string; companyName: string };

const priorityColors: Record<string, string> = {
  LOW: "bg-stone-100 text-stone-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-amber-50 text-amber-700",
  URGENT: "bg-red-50 text-red-700",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-stone-100 text-stone-600",
  SCHEDULED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-stone-100 text-stone-400",
};

const freqLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  SEMIANNUAL: "Semi-annual",
  ANNUAL: "Annual",
  CUSTOM: "Custom",
};

const emptyForm = {
  title: "",
  notes: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "PENDING",
  propertyId: "",
  vendorId: "",
  isRecurring: false,
  recurrenceFrequency: "MONTHLY",
  recurrenceInterval: "1",
  estimatedCost: "",
  actualCost: "",
};

export function MaintenanceClient({
  tasks,
  properties,
  vendors,
}: {
  tasks: Task[];
  properties: Property[];
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [completeTask, setCompleteTask] = useState<Task | null>(null);
  const [actualCostInput, setActualCostInput] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [propFilter, setPropFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchProp = propFilter === "ALL" || t.propertyId === propFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.property?.name ?? "").toLowerCase().includes(q) ||
      (t.vendor?.companyName ?? "").toLowerCase().includes(q) ||
      (t.notes ?? "").toLowerCase().includes(q);
    return matchStatus && matchProp && matchSearch;
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setForm({
      title: t.title,
      notes: t.notes ?? "",
      dueDate: t.dueDate ? format(new Date(t.dueDate), "yyyy-MM-dd") : "",
      priority: t.priority,
      status: t.status,
      propertyId: t.propertyId ?? "",
      vendorId: t.vendorId ?? "",
      isRecurring: t.isRecurring,
      recurrenceFrequency: t.recurrenceFrequency ?? "MONTHLY",
      recurrenceInterval: t.recurrenceInterval?.toString() ?? "1",
      estimatedCost: t.estimatedCost?.toString() ?? "",
      actualCost: t.actualCost?.toString() ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        notes: form.notes || undefined,
        dueDate: form.dueDate || undefined,
        priority: form.priority,
        status: form.status,
        propertyId: form.propertyId || undefined,
        vendorId: form.vendorId || undefined,
        isRecurring: form.isRecurring,
        recurrenceFrequency: form.isRecurring ? form.recurrenceFrequency : undefined,
        recurrenceInterval: form.isRecurring ? form.recurrenceInterval : undefined,
        estimatedCost: form.estimatedCost || undefined,
        actualCost: form.actualCost || undefined,
      };
      if (editing) {
        await updateMaintenanceTask(editing.id, payload);
      } else {
        await createMaintenanceTask(payload);
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
      await deleteMaintenanceTask(id);
      setDeleteId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function openComplete(t: Task) {
    setCompleteTask(t);
    setActualCostInput(t.estimatedCost?.toString() ?? "");
    setCompleteId(t.id);
  }

  async function handleComplete() {
    if (!completeId) return;
    setLoading(true);
    try {
      await completeMaintenanceTask(completeId, actualCostInput || undefined);
      setCompleteId(null);
      setCompleteTask(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const openCount = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED").length;
  const recurringCount = tasks.filter((t) => t.isRecurring).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Maintenance</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {openCount} open · {recurringCount} recurring
          </p>
        </div>
        <Button onClick={openCreate} className="bg-stone-900 text-white hover:bg-stone-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Search + property filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tasks, vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {properties.length > 1 && (
          <select
            value={propFilter}
            onChange={(e) => setPropFilter(e.target.value)}
            className="text-xs border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
          >
            <option value="ALL">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-lg w-fit">
        {["ALL", "PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === s
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {s === "IN_PROGRESS" ? "In Progress" : s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-stone-200 rounded-xl py-16 text-center">
          <Wrench className="w-7 h-7 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500">No tasks found</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">
            {statusFilter !== "ALL" ? "No tasks with this status" : "Add your first maintenance task"}
          </p>
          {statusFilter === "ALL" && (
            <Button onClick={openCreate} variant="outline" size="sm">Add Task</Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-stone-100 bg-stone-50">
                <TableHead className="text-xs font-medium text-stone-500">Task</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Property</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Vendor</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Priority</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Status</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Due / Next</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const overdue =
                  t.dueDate && isPast(new Date(t.dueDate)) && t.status !== "COMPLETED" && t.status !== "CANCELLED";
                return (
                  <TableRow key={t.id} className="border-stone-100 hover:bg-stone-50">
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm text-stone-900">{t.title}</span>
                            {t.isRecurring && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                <RefreshCw className="w-2.5 h-2.5" />
                                {freqLabels[t.recurrenceFrequency ?? ""] ?? "Recurring"}
                              </span>
                            )}
                          </div>
                          {t.notes && (
                            <div className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-xs">{t.notes}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-stone-600">
                      {t.property?.name ?? <span className="text-stone-300 italic text-xs">None</span>}
                    </TableCell>
                    <TableCell className="text-sm text-stone-600">
                      {t.vendor?.companyName ?? <span className="text-stone-300 italic text-xs">None</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>
                        {t.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        {t.dueDate ? (
                          <span className={`text-xs font-medium ${overdue ? "text-red-500" : "text-stone-500"}`}>
                            {format(new Date(t.dueDate), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                        {t.isRecurring && t.nextDueDate && (
                          <div className="text-xs text-blue-500 mt-0.5">
                            Next: {format(new Date(t.nextDueDate), "MMM d")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {t.status !== "COMPLETED" && t.status !== "CANCELLED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-stone-400 hover:text-emerald-600"
                            title="Mark complete"
                            onClick={() => openComplete(t)}
                            disabled={loading}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700" onClick={() => openEdit(t)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-red-500" onClick={() => setDeleteId(t.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Task" : "Add Maintenance Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="HVAC seasonal inspection" />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v ?? "MEDIUM" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "PENDING" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="space-y-1.5">
                <Label>Vendor</Label>
                <Select value={form.vendorId || "none"} onValueChange={(v) => setForm({ ...form, vendorId: v === "none" || v === null ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No vendor</SelectItem>
                    {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Est. Cost ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="0" />
              </div>
              {(form.status === "COMPLETED" || editing?.status === "COMPLETED") && (
                <div className="col-span-2 space-y-1.5">
                  <Label>Actual Cost ($)</Label>
                  <Input type="number" min="0" step="0.01" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} placeholder="0" />
                </div>
              )}

              {/* Recurring toggle */}
              <div className="col-span-2">
                <div className="border border-stone-200 rounded-lg p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                      className="w-4 h-4 rounded border-stone-300 accent-stone-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-stone-900">Recurring task</div>
                      <div className="text-xs text-stone-400">Automatically calculates the next due date</div>
                    </div>
                  </label>
                  {form.isRecurring && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <Label>Frequency</Label>
                        <Select value={form.recurrenceFrequency} onValueChange={(v) => setForm({ ...form, recurrenceFrequency: v ?? "MONTHLY" })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(freqLabels).map(([v, l]) => (
                              <SelectItem key={v} value={v}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {form.recurrenceFrequency === "CUSTOM" && (
                        <div className="space-y-1.5">
                          <Label>Every (months)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={form.recurrenceInterval}
                            onChange={(e) => setForm({ ...form, recurrenceInterval: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional details..." rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim() || loading} className="bg-stone-900 text-white hover:bg-stone-800">
              {loading ? "Saving..." : editing ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Task?</DialogTitle></DialogHeader>
          <p className="text-sm text-stone-500">This will permanently delete the maintenance task.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete with cost */}
      <Dialog open={!!completeId} onOpenChange={() => { setCompleteId(null); setCompleteTask(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Mark Complete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {completeTask && (
              <p className="text-sm text-stone-600 font-medium">{completeTask.title}</p>
            )}
            <div className="space-y-1.5">
              <Label>Actual Cost ($) <span className="text-stone-400 font-normal">— optional</span></Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={actualCostInput}
                onChange={(e) => setActualCostInput(e.target.value)}
                placeholder={completeTask?.estimatedCost ? `Est. $${completeTask.estimatedCost.toLocaleString()}` : "0"}
                autoFocus
              />
              {completeTask?.isRecurring && (
                <p className="text-xs text-blue-500">
                  Recurring — next occurrence will be scheduled automatically.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCompleteId(null); setCompleteTask(null); }}>Cancel</Button>
            <Button onClick={handleComplete} disabled={loading} className="bg-emerald-700 text-white hover:bg-emerald-800">
              {loading ? "Saving..." : "Mark Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
