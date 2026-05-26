"use client";

import { useState } from "react";
import { Bell, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { dismissReminder, createReminder } from "@/app/actions/reminders";
import { useRouter } from "next/navigation";
import { differenceInDays, format } from "date-fns";

type Reminder = {
  id: string;
  message: string;
  remindAt: Date;
  task: { title: string } | null;
  document: { title: string } | null;
  asset: { itemName: string } | null;
  property: { name: string } | null;
};

type Property = { id: string; name: string };

export function RemindersWidget({
  reminders,
  properties,
}: {
  reminders: Reminder[];
  properties: Property[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    message: "",
    remindAt: format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd"),
    propertyId: "",
  });

  async function handleDismiss(id: string) {
    setDismissing(id);
    try {
      await dismissReminder(id);
      router.refresh();
    } finally {
      setDismissing(null);
    }
  }

  async function handleCreate() {
    if (!form.message || !form.remindAt) return;
    setLoading(true);
    try {
      await createReminder({
        message: form.message,
        remindAt: form.remindAt,
        propertyId: form.propertyId || undefined,
      });
      setOpen(false);
      setForm({ message: "", remindAt: format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd"), propertyId: "" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-stone-500" />
            <span className="text-sm font-semibold text-stone-900">Reminders</span>
            {reminders.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 font-medium px-1.5 py-0.5 rounded-full">
                {reminders.length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-stone-400 hover:text-stone-700 gap-1.5"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>

        {reminders.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Check className="w-5 h-5 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-400">All clear — no upcoming reminders</p>
            <button
              onClick={() => setOpen(true)}
              className="text-xs text-stone-400 hover:text-stone-600 mt-1 underline underline-offset-2"
            >
              Add a reminder
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {reminders.map((r) => {
              const linked = r.task?.title ?? r.document?.title ?? r.asset?.itemName ?? r.property?.name;
              const daysUntil = differenceInDays(new Date(r.remindAt), new Date());
              const urgent = daysUntil <= 1;
              return (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3 group">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgent ? "bg-red-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900">{r.message}</div>
                    {linked && <div className="text-xs text-stone-400 mt-0.5 truncate">{linked}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium ${urgent ? "text-red-500" : "text-stone-400"}`}>
                      {daysUntil < 0 ? "Overdue" : daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                    </span>
                    <button
                      onClick={() => handleDismiss(r.id)}
                      disabled={dismissing === r.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Input
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Schedule annual boiler inspection"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Remind on</Label>
              <Input
                type="date"
                value={form.remindAt}
                onChange={(e) => setForm({ ...form, remindAt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Property <span className="text-stone-400 font-normal">— optional</span></Label>
              <Select
                value={form.propertyId || "none"}
                onValueChange={(v) => setForm({ ...form, propertyId: v === "none" || v === null ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No property</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.message || !form.remindAt || loading}
              className="bg-stone-900 text-white hover:bg-stone-800"
            >
              {loading ? "Saving..." : "Add Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
