"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, BookOpen, Wifi, Shield, Phone, Trash2, Key, Zap, FileText, StickyNote, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertOperatingManual } from "@/app/actions/manuals";

type Manual = {
  accessInstructions: string | null;
  utilityShutoffs: string | null;
  wifiNetwork: string | null;
  wifiPassword: string | null;
  securityNotes: string | null;
  alarmCode: string | null;
  emergencyContacts: string | null;
  trashSchedule: string | null;
  houseRules: string | null;
  generalNotes: string | null;
} | null;

type Property = { id: string; name: string; city: string | null; state: string | null };

const sections = [
  {
    key: "accessInstructions",
    label: "Access & Entry",
    icon: Key,
    placeholder: "Gate codes, key lockbox locations, entry procedures, parking instructions...",
    multiline: true,
  },
  {
    key: "utilityShutoffs",
    label: "Utility Shutoffs",
    icon: Zap,
    placeholder: "Main water shutoff location, electrical panel location and breaker map, gas shutoff...",
    multiline: true,
  },
  {
    key: "wifiNetwork",
    label: "Wi-Fi Network",
    icon: Wifi,
    placeholder: "Network name (SSID)",
    multiline: false,
  },
  {
    key: "wifiPassword",
    label: "Wi-Fi Password",
    icon: Wifi,
    placeholder: "Password",
    multiline: false,
  },
  {
    key: "securityNotes",
    label: "Security & Alarm",
    icon: Shield,
    placeholder: "Alarm system details, monitoring company, disarm procedure, camera system access...",
    multiline: true,
  },
  {
    key: "alarmCode",
    label: "Alarm Code",
    icon: Shield,
    placeholder: "PIN or code",
    multiline: false,
  },
  {
    key: "emergencyContacts",
    label: "Emergency Contacts",
    icon: Phone,
    placeholder: "Local police non-emergency, fire department, estate manager cell, nearest hospital...",
    multiline: true,
  },
  {
    key: "trashSchedule",
    label: "Trash & Service Days",
    icon: Trash2,
    placeholder: "Trash pickup: Monday AM. Recycling: every other Monday. Pool service: Friday...",
    multiline: true,
  },
  {
    key: "houseRules",
    label: "House Rules",
    icon: FileText,
    placeholder: "No shoes past the foyer, pool hours, guest policies, smoking policy...",
    multiline: true,
  },
  {
    key: "generalNotes",
    label: "General Notes",
    icon: StickyNote,
    placeholder: "Anything else staff or guests should know about this property...",
    multiline: true,
  },
];

export function ManualClient({ property, manual }: { property: Property; manual: Manual }) {
  const router = useRouter();
  const [form, setForm] = useState({
    accessInstructions: manual?.accessInstructions ?? "",
    utilityShutoffs: manual?.utilityShutoffs ?? "",
    wifiNetwork: manual?.wifiNetwork ?? "",
    wifiPassword: manual?.wifiPassword ?? "",
    securityNotes: manual?.securityNotes ?? "",
    alarmCode: manual?.alarmCode ?? "",
    emergencyContacts: manual?.emergencyContacts ?? "",
    trashSchedule: manual?.trashSchedule ?? "",
    houseRules: manual?.houseRules ?? "",
    generalNotes: manual?.generalNotes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAlarmCode, setShowAlarmCode] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v || undefined])
      );
      await upsertOperatingManual(property.id, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Properties
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-stone-600" />
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Operating Manual</h1>
          </div>
          <p className="text-sm text-stone-400">
            {property.name}
            {property.city && ` · ${property.city}${property.state ? `, ${property.state}` : ""}`}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-stone-900 text-white hover:bg-stone-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : saved ? "Saved" : "Save Manual"}
        </Button>
      </div>

      <p className="text-sm text-stone-500 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        This manual is visible to all staff and managers assigned to this property. Keep codes and sensitive details secure.
      </p>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section) => {
          const Icon = section.icon;
          const value = form[section.key as keyof typeof form];
          return (
            <div key={section.key} className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-stone-600" />
                </div>
                <Label className="text-sm font-semibold text-stone-800">{section.label}</Label>
              </div>
              {section.multiline ? (
                <Textarea
                  value={value}
                  onChange={(e) => setForm({ ...form, [section.key]: e.target.value })}
                  placeholder={section.placeholder}
                  rows={3}
                  className="text-sm resize-none"
                />
              ) : section.key === "wifiPassword" ? (
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => setForm({ ...form, [section.key]: e.target.value })}
                    placeholder={section.placeholder}
                    className="text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ) : section.key === "alarmCode" ? (
                <div className="relative">
                  <Input
                    type={showAlarmCode ? "text" : "password"}
                    value={value}
                    onChange={(e) => setForm({ ...form, [section.key]: e.target.value })}
                    placeholder={section.placeholder}
                    className="text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAlarmCode((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showAlarmCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <Input
                  value={value}
                  onChange={(e) => setForm({ ...form, [section.key]: e.target.value })}
                  placeholder={section.placeholder}
                  className="text-sm"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pb-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-stone-900 text-white hover:bg-stone-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : saved ? "Saved" : "Save Manual"}
        </Button>
      </div>
    </div>
  );
}
