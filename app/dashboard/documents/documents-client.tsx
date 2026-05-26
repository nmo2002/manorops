"use client";

import { useState } from "react";
import { Plus, FileText, Pencil, Trash2, AlertTriangle, ExternalLink, Upload, X } from "lucide-react";
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
import { createDocument, updateDocument, deleteDocument } from "@/app/actions/documents";
import { useRouter } from "next/navigation";
import { format, isPast, isWithinInterval, addDays } from "date-fns";

type Document = {
  id: string;
  title: string;
  category: string;
  expirationDate: Date | null;
  notes: string | null;
  fileUrl: string | null;
  propertyId: string | null;
  property: { id: string; name: string } | null;
};

type Property = { id: string; name: string };

const categoryColors: Record<string, string> = {
  INSURANCE: "bg-blue-50 text-blue-700",
  WARRANTY: "bg-violet-50 text-violet-700",
  CONTRACT: "bg-amber-50 text-amber-700",
  DEED: "bg-stone-100 text-stone-700",
  TAX: "bg-emerald-50 text-emerald-700",
  OTHER: "bg-stone-100 text-stone-500",
};

const categories = ["INSURANCE", "WARRANTY", "CONTRACT", "DEED", "TAX", "OTHER"];

const emptyForm = {
  title: "",
  category: "OTHER",
  expirationDate: "",
  notes: "",
  fileUrl: "",
  propertyId: "",
};

export function DocumentsClient({
  documents,
  properties,
}: {
  documents: Document[];
  properties: Property[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("ALL");
  const [propFilter, setPropFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = documents.filter((d) => {
    const matchCat = catFilter === "ALL" || d.category === catFilter;
    const matchProp = propFilter === "ALL" || d.propertyId === propFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      (d.property?.name ?? "").toLowerCase().includes(q) ||
      (d.notes ?? "").toLowerCase().includes(q);
    return matchCat && matchProp && matchSearch;
  });

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setForm((f) => ({ ...f, fileUrl: url }));
      setUploadedName(file.name);
    } catch {
      alert("File upload failed. Check your BLOB_READ_WRITE_TOKEN in .env.");
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setUploadedName(null);
    setOpen(true);
  }

  function openEdit(d: Document) {
    setEditing(d);
    setUploadedName(d.fileUrl ? d.fileUrl.split("/").pop() ?? null : null);
    setForm({
      title: d.title,
      category: d.category,
      expirationDate: d.expirationDate ? format(new Date(d.expirationDate), "yyyy-MM-dd") : "",
      notes: d.notes ?? "",
      fileUrl: d.fileUrl ?? "",
      propertyId: d.propertyId ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        expirationDate: form.expirationDate || undefined,
        notes: form.notes || undefined,
        fileUrl: form.fileUrl || undefined,
        propertyId: form.propertyId || undefined,
      };
      if (editing) {
        await updateDocument(editing.id, payload);
      } else {
        await createDocument(payload);
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
      await deleteDocument(id);
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
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Documents</h1>
          <p className="text-sm text-stone-500 mt-1">{documents.length} documents on file</p>
        </div>
        <Button onClick={openCreate} className="bg-stone-900 text-white hover:bg-stone-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search + property filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search documents..."
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

      {/* Category filter */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-lg w-fit flex-wrap">
        {["ALL", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              catFilter === c
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {c === "ALL" ? "All" : c.charAt(0) + c.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-stone-200 rounded-xl py-20 text-center">
          <FileText className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-500">No documents found</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">
            {catFilter !== "ALL" ? "No documents in this category" : "Add your first document"}
          </p>
          {catFilter === "ALL" && (
            <Button onClick={openCreate} variant="outline" size="sm">
              Add Document
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-stone-100">
                <TableHead className="text-xs font-medium text-stone-500">Document</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Category</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Property</TableHead>
                <TableHead className="text-xs font-medium text-stone-500">Expiration</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const expDate = d.expirationDate ? new Date(d.expirationDate) : null;
                const expired = expDate && isPast(expDate);
                const expiringSoon =
                  expDate &&
                  !expired &&
                  isWithinInterval(expDate, {
                    start: new Date(),
                    end: addDays(new Date(), 30),
                  });
                return (
                  <TableRow key={d.id} className="border-stone-100 hover:bg-stone-50">
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {(expired || expiringSoon) && (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${expired ? "text-red-500" : "text-amber-500"}`}
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm text-stone-900">{d.title}</div>
                          {d.notes && (
                            <div className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-sm">
                              {d.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[d.category]}`}
                      >
                        {d.category.charAt(0) + d.category.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-stone-600">
                      {d.property?.name ?? (
                        <span className="text-stone-300 italic text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.expirationDate ? (
                        <span
                          className={`text-xs font-medium ${
                            expired
                              ? "text-red-500"
                              : expiringSoon
                              ? "text-amber-600"
                              : "text-stone-500"
                          }`}
                        >
                          {format(expDate!, "MMM d, yyyy")}
                          {expired && " · Expired"}
                          {expiringSoon && " · Soon"}
                        </span>
                      ) : (
                        <span className="text-stone-300 text-xs">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {d.fileUrl && (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 w-7 flex items-center justify-center rounded text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Open document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
                          onClick={() => openEdit(d)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-stone-400 hover:text-red-500"
                          onClick={() => setDeleteId(d.id)}
                        >
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Document" : "Add Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Document Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Homeowner's Insurance Policy"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v ?? "OTHER" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="col-span-2 space-y-1.5">
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={form.expirationDate}
                  onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>File <span className="text-stone-400 font-normal">— optional</span></Label>
                {form.fileUrl && uploadedName ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg">
                    <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="text-sm text-stone-700 truncate flex-1">{uploadedName}</span>
                    <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, fileUrl: "" })); setUploadedName(null); }}
                      className="text-stone-400 hover:text-red-500 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? "border-stone-200 bg-stone-50" : "border-stone-200 hover:border-stone-400 hover:bg-stone-50"}`}>
                    <Upload className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="text-sm text-stone-500">
                      {uploading ? "Uploading..." : "Click to upload PDF, image, or document"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                    />
                  </label>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Policy number, provider details, etc."
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
              disabled={!form.title || loading || uploading}
              className="bg-stone-900 text-white hover:bg-stone-800"
            >
              {loading ? "Saving..." : editing ? "Save Changes" : "Add Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-500">This will permanently remove the document record.</p>
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
