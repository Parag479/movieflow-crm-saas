"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  LayoutDashboard,
  Building2,
  Users,
  Clapperboard,
  Tv2,
  Truck,
  MapPin,
  KanbanSquare,
  FileCheck2,
  CalendarDays,
  CreditCard,
  BarChart3,
  Bell,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  Coins,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  allowedRoles: string[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowedRoles: ["ALL"] },
  { name: "Distributor 360°", href: "/distributors", icon: Truck, badge: "360°", allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER", "DISTRIBUTOR"] },
  { name: "Screen Tracking", href: "/collections", icon: Tv2, badge: "LIVE", allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER", "DISTRIBUTOR", "STATE_MANAGER", "DATA_ENTRY"] },
  { name: "State Financials", href: "/map", icon: MapPin, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "STATE_MANAGER", "FINANCE_MANAGER"] },
  { name: "Movie Catalog", href: "/movies", icon: Clapperboard, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "DISTRIBUTOR"] },
  { name: "Distribution Hub", href: "/distribution", icon: Layers, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN"] },
  { name: "Theatre Management", href: "/theaters", icon: Building2, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "STATE_MANAGER", "DATA_ENTRY"] },
  { name: "Finance & Ledgers", href: "/finance", icon: Receipt, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER"] },
  { name: "Payments & Invoices", href: "/payments", icon: CreditCard, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER", "DISTRIBUTOR"] },
  { name: "Deals & Contracts", href: "/deals", icon: FileCheck2, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER", "DISTRIBUTOR"] },
  { name: "Show Scheduling", href: "/scheduling", icon: CalendarDays, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "STATE_MANAGER", "DATA_ENTRY"] },
  { name: "CRM Pipeline", href: "/crm", icon: KanbanSquare, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE"] },
  { name: "Reports & Audits", href: "/reports", icon: BarChart3, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER", "DISTRIBUTOR", "STATE_MANAGER"] },
  { name: "Notifications", href: "/notifications", icon: Bell, allowedRoles: ["ALL"] },
  { name: "User & Role Mgmt", href: "/users", icon: Users, allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN"] },
  { name: "AI Insights", href: "/ai-insights", icon: Sparkles, badge: "AI", allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "FINANCE_MANAGER"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>(["SUPER_ADMIN"]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("movieflow_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.roles)) setUserRoles(parsed.roles);
      }
    } catch {}
  }, []);

  const isDistributor = userRoles.includes("DISTRIBUTOR");
  const isStateManager = userRoles.includes("STATE_MANAGER");
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("COMPANY_ADMIN");

  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.allowedRoles.includes("ALL")) return true;
    return item.allowedRoles.some((r) => userRoles.includes(r));
  }).map((item) => {
    // Role-specific labeling
    if (isDistributor) {
      if (item.href === "/dashboard") return { ...item, name: "Distributor Portal" };
      if (item.href === "/distributors") return { ...item, name: "My Ledger & Profile" };
      if (item.href === "/payments") return { ...item, name: "My Invoices & Due" };
      if (item.href === "/deals") return { ...item, name: "My Agreements" };
    }
    if (isStateManager) {
      if (item.href === "/dashboard") return { ...item, name: "State Dashboard" };
      if (item.href === "/map") return { ...item, name: "State Territory Map" };
      if (item.href === "/theaters") return { ...item, name: "State Theatres" };
    }
    return item;
  });

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 z-30 h-screen sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cinema-accent text-white shadow-md shadow-brand-500/20 shrink-0">
            <Film className="w-5 h-5 animate-pulse-slow" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-gray-900 via-brand-600 to-brand-500 dark:from-white dark:via-gray-100 dark:to-brand-400 bg-clip-text text-transparent">
                MovieFlow
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-brand-600 dark:text-brand-400 uppercase -mt-1">
                Distribution CRM
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-brand-500"
                )}
              />
              {!collapsed && (
                <span className="truncate flex-1">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Tenant Indicator & Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs">
                MC
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Metro Cinema Group
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  Enterprise Tier
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link
              href="/login"
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
