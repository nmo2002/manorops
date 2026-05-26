"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Overview", description: "Estate at a glance" },
  "/dashboard/properties": { title: "Properties", description: "Manage your portfolio" },
  "/dashboard/vendors": { title: "Vendors", description: "Contractors and service providers" },
  "/dashboard/maintenance": { title: "Maintenance", description: "Tasks and schedules" },
  "/dashboard/documents": { title: "Documents", description: "Policies, warranties, and records" },
  "/dashboard/inventory": { title: "Inventory", description: "Household assets and equipment" },
  "/dashboard/financials": { title: "Financials", description: "Budget tracking and expense log" },
};

function getPageMeta(pathname: string) {
  if (pathname.includes("/manual")) return { title: "Operating Manual", description: "Property operating instructions" };
  return pageTitles[pathname] ?? { title: "ManorOps", description: "" };
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-between px-4 sm:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-stone-500 hover:text-stone-900 p-1 -ml-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{meta.title}</h2>
          {meta.description && (
            <p className="text-xs text-stone-400 leading-none mt-0.5">{meta.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-stone-400 hover:text-stone-700">
          <Bell className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-stone-700 leading-none">{user?.name ?? "—"}</p>
            <p className="text-xs text-stone-400 leading-none mt-0.5">{user?.email ?? ""}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(user?.name)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-stone-400 hover:text-stone-700"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
