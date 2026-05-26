"use client";

import { useState } from "react";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
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
import { createAsset, updateAsset, deleteAsset } from "@/app/actions/assets";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Asset = {
  id: string;
  itemName: string;
  room: string | null;
  estimatedValue: number | null;
  purchaseDate: Date | null;
  warrantyExpiration: Date | null;
  notes: string | null;
  propertyId: string | null;
  property: { id: string; name: string } | null;
};

type Property = { id: string; name: string };

const emptyForm = {
  itemName: "",
  room: "",
  estimatedValue: "",
  purchaseDate: "",
  warrantyExpiration: "",
  notes: "",
  propertyId: "",
};

export function InventoryClient({
  assets,
  properties,
}: {
  assets: Asset[];
  properties: Property[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [propFilter, setPropFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = assets.filter((a) => {
    const matchProp = propFilter === "ALL" || a.propertyId === propFilter;
    const matchSearch =
      a.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (a.room ?? "").toLowerCase().includes(search.toLowerCase());
    return matchProp && matchSearch;
  });

  const totalValue = filtered.reduce((sum, a) => sum + (a.estimatedValue ?? 0), 0);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(a: Asset) {
    setEditing(a);
    setForm({
      itemName: a.itemName,
      room: a.room ?? "",
      estimatedValue: a.estimatedValue?.toString() ?? "",
      purchaseDate: a.purchaseDate ? format(new Date(a.purchaseDate), "yyyy-MM-dd") : "",
      warrantyExpiration: a.warrantyExpiration ? format(new Date(a.warrantyExpiration), "yyyy-MM-dd") : "",
      notes: a.notes ?? "",
      propertyId: a.propertyId ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        itemName: form.itemName,
        room: form.room || undefined,
        estimatedValue: form.estimatedValue || undefined,
        purchaseDate: form.purchaseDate || undefined,
        warrantyExpiration: form.warrantyExpiration || undefined,
        notes: form.notes || undefined,
        propertyId: form.propertyId || undefined,
      };
      if (editing) {
        await updateAsset(editing.id, payload);
      } else {
        await createAsset(payload);
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
      await deleteAsset(id);
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
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            Household Inventory
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {assets.length} items ·{" "}
            <span className="font-medium text-stone-700">
              ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} total estimated value
            </span>
          </p>
        </div>
        <Button onClick={openCreate} className="bg-stone-900 text-white hover:bg-stone-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={propFilter} onValueChange={(v) => setPropFilter(v ?? "ALL")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All properties</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-stone-200 rounded-xl py-20 text-center">
          <Package className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500">No items found</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">
            {search || propFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Add your first inventory item"}
          </p>
          {!search && propFilter === "ALL" && (
            <Button onClick={openCreate} variant="outline" size="sm">
              Add Item
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-stone-100">
                <TableHead className="text-xs font-medium text-stone-500">Item</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Room / Location</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Property</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Est. Value</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Purchased</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Warranty</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="border-stone-100 hover:bg-stone-50">
                  <TableCell>
                    <div className="font-medium text-sm text-stone-900">{a.itemName}</div>
                    {a.notes && (
                      <div className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-xs">
                        {a.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {a.room ?? <span className="text-stone-300 italic text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {a.property?.name ?? (
                      <span className="text-stone-300 italic text-xs">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-stone-700">
                    {a.estimatedValue != null
                      ? `$${a.estimatedValue.toLocaleString("en-US")}`
                      : <span className="text-stone-300 text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {a.purchaseDate ? format(new Date(a.purchaseDate), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {a.warrantyExpiration ? format(new Date(a.warrantyExpiration), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-stone-400 hover:text-red-500"
                        onClick={() => setDeleteId(a.id)}
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
            <DialogTitle>{editing ? "Edit Item" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Item Name *</Label>
                <Input
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  placeholder='Sub-Zero 48" Refrigerator'
                />
              </div>
              <div className="space-y-1.5">
                <Label>Room / Location</Label>
                <Input
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="Main Kitchen"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Property</Label>
                <Select
                  value={form.propertyId}
                  onValueChange={(v) => setForm({ ...form, propertyId: v === "none" || v === null ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No property</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estimated Value ($)</Label>
                <Input
                  type="number"
                  value={form.estimatedValue}
                  onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
                  placeholder="14500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Warranty Expiration</Label>
                <Input
                  type="date"
                  value={form.warrantyExpiration}
                  onChange={(e) => setForm({ ...form, warrantyExpiration: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Serial number, model details, etc."
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
              disabled={!form.itemName || loading}
              className="bg-stone-900 text-white hover:bg-stone-800"
            >
              {loading ? "Saving..." : editing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-500">
            This will permanently remove the inventory item.
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
