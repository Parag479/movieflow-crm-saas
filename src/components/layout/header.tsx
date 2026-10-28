"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sun,
  Moon,
  Bell,
  Building,
  User,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string; roles: string[]; company?: { name: string } } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("movieflow_user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const displayName = currentUser?.fullName || "Admin User";
  const displayEmail = currentUser?.email || "admin@movieflow.com";
  const displayRole = currentUser?.roles?.[0]?.replace("_", " ") || "Super Admin";
  const companyName = currentUser?.company?.name || "Metro Cinema Group";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const mockNotifications = [
    {
      id: 1,
      title: "New Deal Signed",
      desc: "Metro Cinema Screen 3 signed for 'Avatar: Fire & Ash'",
      time: "10 mins ago",
      type: "deal",
    },
    {
      id: 2,
      title: "Payment Overdue",
      desc: "PVR Directors Cut payment settlement pending ₹4,50,000",
      time: "2 hours ago",
      type: "payment",
    },
    {
      id: 3,
      title: "AI Forecast Alert",
      desc: "High demand predicted for Weekend 1 (94% Occupancy)",
      time: "5 hours ago",
      type: "ai",
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies, theaters, agreements, leads..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Tenant / Company Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs font-semibold text-gray-700 dark:text-gray-200"
          >
            <Building className="w-3.5 h-3.5 text-brand-500" />
            <span>{companyName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showCompanyMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                Switch Tenant Organization
              </div>
              <button
                className="w-full flex items-center justify-between p-2 rounded-xl bg-brand-500/10 text-brand-500 font-medium"
                onClick={() => setShowCompanyMenu(false)}
              >
                <span>Metro Cinema Group</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                onClick={() => setShowCompanyMenu(false)}
              >
                <span>Apex Distribution Films</span>
              </button>
              <button
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                onClick={() => setShowCompanyMenu(false)}
              >
                <span>Starlight Studios International</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Quick Insight Button */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Engine Active</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Notifications
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto custom-scrollbar my-2">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {displayName}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
                <p className="text-gray-400 text-[10px]">{displayEmail}</p>
              </div>
              <button
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-3.5 h-3.5 text-brand-500" />
                <span>My Profile</span>
              </button>
              <button
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold"
                onClick={async () => {
                  setShowUserMenu(false);
                  localStorage.removeItem("movieflow_token");
                  localStorage.removeItem("movieflow_user");
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
