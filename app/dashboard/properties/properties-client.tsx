"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Pencil, Trash2, Building2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createProperty, updateProperty, deleteProperty } from "@/app/actions/properties";
import { useRouter } from "next/navigation";

type Property = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  propertyType: string;
  imageUrl: string | null;
  notes: string | null;
  annualBudget: number | null;
  _count: { tasks: number; vendors: number; documents: number; assets: number };
};

const propertyTypeLabels: Record<string, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  VACATION: "Vacation",
  INVESTMENT: "Investment",
  OTHER: "Other",
};

const propertyTypeBadge: Record<string, string> = {
  PRIMARY: "bg-stone-900 text-white",
  SECONDARY: "bg-stone-100 text-stone-700",
  VACATION: "bg-blue-50 text-blue-700",
  INVESTMENT: "bg-emerald-50 text-emerald-700",
  OTHER: "bg-stone-100 text-stone-600",
};

const emptyForm = {
  name: "",
  address: "",
  city: "",
  state: "",
  country: "USA",
  propertyType: "PRIMARY",
  imageUrl: "",
  notes: "",
  annualBudget: "",
};

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Property) {
    setEditing(p);
    setForm({
      name: p.name,
      address: p.address,
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country ?? "USA",
      propertyType: p.propertyType,
      imageUrl: p.imageUrl ?? "",
      notes: p.notes ?? "",
      annualBudget: p.annualBudget?.toString() ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.address.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        propertyType: form.propertyType,
        imageUrl: form.imageUrl || undefined,
        notes: form.notes || undefined,
        annualBudget: form.annualBudget || undefined,
      };
      if (editing) {
        await updateProperty(editing.id, payload);
      } else {
        await createProperty(payload);
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
      await deleteProperty(id);
      setDeleteId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Properties</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {properties.length} {properties.length === 1 ? "property" : "properties"} managed
          </p>
        </div>
        <Button onClick={openCreate} className="bg-stone-900 text-white hover:bg-stone-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="border border-dashed border-stone-200 rounded-xl py-20 text-center">
          <Building2 className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500">No properties yet</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">Add your first property to get started</p>
          <Button onClick={openCreate} variant="outline" size="sm">Add Property</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-stone-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-stone-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-stone-900 text-sm leading-tight">{p.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${propertyTypeBadge[p.propertyType]}`}>
                    {propertyTypeLabels[p.propertyType]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-4">
                  <MapPin className="w-3 h-3" />
                  {[p.address, p.city, p.state].filter(Boolean).join(", ")}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  {[
                    { label: "Tasks", value: p._count.tasks },
                    { label: "Vendors", value: p._count.vendors },
                    { label: "Docs", value: p._count.documents },
                    { label: "Assets", value: p._count.assets },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-stone-50 rounded-lg py-2">
                      <div className="text-sm font-bold text-stone-900">{stat.value}</div>
                      <div className="text-xs text-stone-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {p.notes && <p className="text-xs text-stone-400 line-clamp-2 mb-4">{p.notes}</p>}
                <div className="space-y-2">
                  <Link href={`/dashboard/properties/${p.id}/manual`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs border-stone-200 text-stone-600 hover:bg-stone-50">
                      <BookOpen className="w-3 h-3 mr-1.5" />
                      Operating Manual
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs border-stone-200" onClick={() => openEdit(p)}>
                      <Pencil className="w-3 h-3 mr-1.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs border-stone-200 text-red-500 hover:bg-red-50 hover:border-red-200" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Property" : "Add Property"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Property Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="The Hamptons Estate" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Street Address *</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="14 Meadow Lane" />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Southampton" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="NY" />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="USA" />
              </div>
              <div className="space-y-1.5">
                <Label>Property Type</Label>
                <Select value={form.propertyType} onValueChange={(v) => setForm({ ...form, propertyType: v ?? "PRIMARY" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(propertyTypeLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Annual Budget ($)</Label>
                <Input type="number" min="0" value={form.annualBudget} onChange={(e) => setForm({ ...form, annualBudget: e.target.value })} placeholder="120000" />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional details..." rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.address.trim() || loading} className="bg-stone-900 text-white hover:bg-stone-800">
              {loading ? "Saving..." : editing ? "Save Changes" : "Add Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Property?</DialogTitle></DialogHeader>
          <p className="text-sm text-stone-500">This will permanently delete the property and cannot be undone.</p>
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
