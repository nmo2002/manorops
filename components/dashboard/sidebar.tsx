"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  MapPin,
  Users,
  Wrench,
  FileText,
  Package,
  TrendingUp,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: MapPin },
  { href: "/dashboard/vendors", label: "Vendors", icon: Users },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/financials", label: "Financials", icon: TrendingUp },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-stone-950 text-white h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-stone-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-stone-950" />
          </div>
          <span className="font-semibold text-sm tracking-tight">ManorOps</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Estate selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-stone-900 rounded-lg px-3 py-2.5 border border-stone-800">
          <div className="text-xs text-stone-500 mb-0.5 font-medium uppercase tracking-wider">Estate</div>
          <div className="text-sm font-medium text-white truncate">Hargrove Family Office</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-medium text-stone-600 px-3 pb-2 uppercase tracking-wider">Operations</div>
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white text-stone-950 font-medium"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-stone-800 space-y-0.5">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <div className="px-3 pt-3 mt-1 border-t border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-stone-300 truncate">{user?.name ?? "—"}</div>
              <div className="text-xs text-stone-600 truncate">{user?.email ?? ""}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
