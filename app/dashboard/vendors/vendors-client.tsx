"use client";

import { useState } from "react";
import { Plus, Users, Pencil, Trash2, Phone, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createVendor, updateVendor, deleteVendor } from "@/app/actions/vendors";
import { useRouter } from "next/navigation";

type Vendor = {
  id: string;
  companyName: string;
  serviceType: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: string;
  propertyId: string | null;
  property: { id: string; name: string } | null;
};

type Property = { id: string; name: string };

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-stone-100 text-stone-500",
  PENDING: "bg-amber-50 text-amber-700",
};

const emptyForm = {
  companyName: "",
  serviceType: "",
  contactName: "",
  phone: "",
  email: "",
  notes: "",
  status: "ACTIVE",
  propertyId: "",
};

export function VendorsClient({
  vendors,
  properties,
}: {
  vendors: Vendor[];
  properties: Property[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [propFilter, setPropFilter] = useState("ALL");

  const filtered = vendors.filter((v) => {
    const matchProp = propFilter === "ALL" || v.propertyId === propFilter || (propFilter === "ALL" && !v.propertyId);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.companyName.toLowerCase().includes(q) ||
      v.serviceType.toLowerCase().includes(q) ||
      (v.contactName ?? "").toLowerCase().includes(q);
    return matchProp && matchSearch;
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(v: Vendor) {
    setEditing(v);
    setForm({
      companyName: v.companyName,
      serviceType: v.serviceType,
      contactName: v.contactName ?? "",
      phone: v.phone ?? "",
      email: v.email ?? "",
      notes: v.notes ?? "",
      status: v.status,
      propertyId: v.propertyId ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        companyName: form.companyName,
        serviceType: form.serviceType,
        contactName: form.contactName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        notes: form.notes || undefined,
        status: form.status,
        propertyId: form.propertyId || undefined,
      };
      if (editing) {
        await updateVendor(editing.id, payload);
      } else {
        await createVendor(payload);
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
      await deleteVendor(id);
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
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Vendors</h1>
          <p className="text-sm text-stone-500 mt-1">
            {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"} across all properties
          </p>
        </div>
        <Button onClick={openCreate} className="bg-stone-900 text-white hover:bg-stone-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search vendors..."
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

      {filtered.length === 0 ? (
        <div className="border border-dashed border-stone-200 rounded-xl py-20 text-center">
          <Users className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500">No vendors found</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">
            {search ? "Try a different search term" : "Add your first vendor to get started"}
          </p>
          {!search && (
            <Button onClick={openCreate} variant="outline" size="sm">
              Add Vendor
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-stone-100">
                <TableHead className="text-xs font-medium text-stone-500">Company</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Service</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Contact</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Property</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id} className="border-stone-100 hover:bg-stone-50">
                  <TableCell>
                    <div className="font-medium text-sm text-stone-900">{v.companyName}</div>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">{v.serviceType}</TableCell>
                  <TableCell>
                    <div className="text-sm text-stone-700">{v.contactName ?? "—"}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {v.phone && (
                        <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors">
                          <Phone className="w-3 h-3" />
                          {v.phone}
                        </a>
                      )}
                      {v.email && (
                        <a href={`mailto:${v.email}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors">
                          <Mail className="w-3 h-3" />
                          {v.email}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {v.property?.name ?? (
                      <span className="text-stone-300 text-xs italic">All properties</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[v.status]}`}
                    >
                      {v.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
                        onClick={() => openEdit(v)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-stone-400 hover:text-red-500"
                        onClick={() => setDeleteId(v.id)}
                      >
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

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Company Name *</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Elite Climate Systems"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Service Type *</Label>
                <Input
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  placeholder="HVAC, Pool Maintenance, Security..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contact Name</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Robert Chen"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v ?? "ACTIVE" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(631) 555-0142"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@vendor.com"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Assigned Property</Label>
                <Select
                  value={form.propertyId}
                  onValueChange={(v) => setForm({ ...form, propertyId: v === "none" || v === null ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All properties</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional details..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.companyName || !form.serviceType || loading}
              className="bg-stone-900 text-white hover:bg-stone-800"
            >
              {loading ? "Saving..." : editing ? "Save Changes" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Vendor?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-500">
            This will permanently delete the vendor record. Tasks assigned to this vendor will be
            unlinked.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
