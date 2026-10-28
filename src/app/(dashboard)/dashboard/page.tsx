"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Film,
  Tv2,
  FileCheck2,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  Plus,
  Building,
  Calendar,
  Layers,
  MapPin,
  Coins,
  Receipt,
  DollarSign,
  PieChart as PieChartIcon,
  ChevronRight,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const role = data?.role || "SUPER_ADMIN";
  const profile = data?.profile;
  const kpis = data?.kpis || {};

  const colors = ["#0c8de9", "#e50914", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

  // ──────────────────────────────────────────────────────────────────────────
  // 1. DISTRIBUTOR ROLE VIEW
  // ──────────────────────────────────────────────────────────────────────────
  if (role === "DISTRIBUTOR") {
    const moviePerformance = data?.charts?.moviePerformance || [];
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Distributor Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-purple-950/40 to-gray-950 border border-purple-500/20 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Distributor Partner Workspace • {profile?.name || "Distributor Partner"}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              {profile?.name} Performance Portal
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm">
              Territory: <strong className="text-purple-300">{profile?.territory || "Pan India"}</strong> | Code: <span className="font-mono text-purple-300">{profile?.code}</span> | Contact: {profile?.contactPerson}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            {profile?.id && (
              <Link
                href={`/distributors/${profile.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md shadow-purple-600/30"
              >
                <Coins className="w-4 h-4" />
                <span>My 360° Ledger</span>
              </Link>
            )}
            <Link
              href="/collections"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition backdrop-blur-sm"
            >
              <Tv2 className="w-4 h-4 text-purple-400" />
              <span>Screen Collections</span>
            </Link>
            <Link
              href="/payments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition backdrop-blur-sm"
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>My Invoices</span>
            </Link>
          </div>
        </div>

        {/* Distributor Scoped Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Outstanding Balance */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>Outstanding Receivable</span>
              <Coins className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {formatCurrency(kpis.outstandingBalance || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Overdue: {formatCurrency(kpis.overdueAmount || 0)}</span>
            </div>
          </div>

          {/* Distributor Share */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>My Distributor Share</span>
              <Receipt className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(kpis.distributorShare || 0)}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Net of GST and exhibitor splits
            </div>
          </div>

          {/* Gross Collection */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-brand-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>Gross Box Office</span>
              <Tv2 className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {formatCurrency(kpis.totalGrossRevenue || 0)}
            </div>
            <div className="text-[11px] text-brand-400 font-medium">
              Across active theaters & screens
            </div>
          </div>

          {/* Active Screens */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>Active Screens & Theatres</span>
              <Building className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {kpis.activeScreens || 0} Screens
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              In {kpis.totalTheatres || 0} Theatrical Multiplexes
            </div>
          </div>
        </div>

        {/* Second Row: Invoiced vs Received & Movie Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Settlement Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Invoicing & Payment Status</span>
            </h3>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400">Total Invoiced Amount</span>
                <span className="font-bold text-sm text-white">{formatCurrency(kpis.totalInvoiced || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-emerald-300">Payments Received</span>
                <span className="font-bold text-sm text-emerald-400">{formatCurrency(kpis.totalReceived || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400">Total Audience Attendance</span>
                <span className="font-bold text-sm text-white">{(kpis.totalAdmissions || 0).toLocaleString("en-IN")} Admissions</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-gray-400">Total Shows Run</span>
                <span className="font-bold text-sm text-white">{kpis.totalShows || 0} Shows</span>
              </div>
            </div>
          </div>

          {/* Movie Performance Table for this Distributor */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                <span>My Distributed Movies Performance</span>
              </div>
              <Link href="/deals" className="text-xs text-brand-400 hover:underline">
                View All Deals →
              </Link>
            </h3>

            {moviePerformance.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No active collections recorded yet for this distributor account.
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {moviePerformance.map((m: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">{m.title}</div>
                      <div className="text-[11px] text-gray-400">
                        {m.tickets?.toLocaleString("en-IN")} admissions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">
                        {formatCurrency(m.distShare)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Gross: {formatCurrency(m.gross)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STATE MANAGER ROLE VIEW
  // ──────────────────────────────────────────────────────────────────────────
  if (role === "STATE_MANAGER") {
    const territoryData = data?.charts?.territoryRevenue || [];
    const moviePerformance = data?.charts?.moviePerformance || [];
    return (
      <div className="space-y-8 animate-fade-in">
        {/* State Manager Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-blue-950/40 to-gray-950 border border-blue-500/20 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>State Distribution Hub • {profile?.state || "Assigned State"} Circuit</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              {profile?.state} Theatrical Operations
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm">
              Dedicated territory console for regional theaters, screen scheduling, and circuit box office collections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              href="/theaters"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-600/30"
            >
              <Building className="w-4 h-4" />
              <span>State Theatres</span>
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition backdrop-blur-sm"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Circuit Map</span>
            </Link>
            <Link
              href="/collections"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition backdrop-blur-sm"
            >
              <Tv2 className="w-4 h-4 text-blue-400" />
              <span>Live Collections</span>
            </Link>
          </div>
        </div>

        {/* State Scoped Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>State Gross Box Office</span>
              <Coins className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {formatCurrency(kpis.totalGrossRevenue || 0)}
            </div>
            <div className="text-[11px] text-blue-400 font-medium">In {profile?.state} Circuit</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>Net Collection</span>
              <Receipt className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(kpis.totalNetCollection || 0)}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">After regional GST splits</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>Theaters & Screens</span>
              <Building className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {kpis.totalTheatres || 0} Theaters / {kpis.totalScreens || 0} Screens
            </div>
            <div className="text-[11px] text-amber-400 font-medium">Operating in {profile?.state}</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
              <span>Audience Admissions</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {(kpis.totalAdmissions || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-purple-400 font-medium">Across {kpis.totalShows || 0} Shows</div>
          </div>
        </div>

        {/* City Breakdown & Top Movies in State */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>City-Wise Box Office in {profile?.state}</span>
            </h3>
            <div className="space-y-3 pt-2">
              {territoryData.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs font-semibold text-white">{item.name}</span>
                  <span className="font-bold text-sm text-blue-400">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-blue-400" />
              <span>Top Movies in {profile?.state}</span>
            </h3>
            <div className="divide-y divide-gray-800">
              {moviePerformance.map((m: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{m.title}</span>
                  <span className="font-bold text-sm text-emerald-400">{formatCurrency(m.gross)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SUPER ADMIN & FINANCE MANAGER VIEW (COMPANY-WIDE TELEMETRY)
  // ──────────────────────────────────────────────────────────────────────────
  const territoryChart = data?.charts?.territoryRevenue || [
    { name: "Mumbai Circuit", value: 1400000000 },
    { name: "North India", value: 1200000000 },
    { name: "South India", value: 800000000 },
    { name: "Maharashtra", value: 600000000 },
    { name: "East India", value: 200000000 },
    { name: "Overseas", value: 500000000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-brand-950 to-gray-950 border border-gray-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Pan-India Film Distribution & Box Office Command Center</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Executive Distribution Telemetry
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm">
            Live revenue, distribution cost, profit analysis, and circuit performance across Mumbai and global territories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/distributors"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-md shadow-brand-600/30"
          >
            <Coins className="w-4 h-4" />
            <span>Distributor 360°</span>
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition backdrop-blur-sm"
          >
            <MapPin className="w-4 h-4 text-brand-400" />
            <span>Interactive Map</span>
          </Link>
        </div>
      </div>

      {/* 9 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
            <span>Total Movies</span>
            <Film className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-white">{kpis.totalMovies || 5} Films</div>
          <div className="text-[11px] text-brand-400 font-medium">Full distribution catalog</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
            <span>Active Distributions</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-white">{kpis.activeDistributions || 12} Circuits</div>
          <div className="text-[11px] text-emerald-400 font-medium">Running in theaters now</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
            <span>Total Screens</span>
            <Tv2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-white">{(kpis.totalScreens || 14200).toLocaleString()} Screens</div>
          <div className="text-[11px] text-amber-400 font-medium">{kpis.totalTheatres || 4800} Partner Theatres</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
            <span>Gross Box Office</span>
            <Coins className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-white">{formatCurrency(kpis.totalRevenue || 0)}</div>
          <div className="text-[11px] text-blue-400 font-medium">Across all circuits</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
            <span>Net Profit (Distributor)</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{formatCurrency(kpis.netProfit || 0)}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Distributor Share minus P&A</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-semibold">
            <span>Pending Receivables</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">{formatCurrency(kpis.pendingPayments || 0)}</div>
          <div className="text-[11px] text-red-400 font-medium">Distributor & exhibitor dues</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-brand-500" />
            <span>Territory Revenue Share</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={territoryChart}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {territoryChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-500" />
              <span>Top Movie Collections</span>
            </div>
            <Link href="/reports" className="text-xs text-brand-400 hover:underline">
              Full Analytics →
            </Link>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.moviePerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="title" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(val) => `₹${(val / 10000000).toFixed(0)}Cr`} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Bar dataKey="gross" fill="#0c8de9" radius={[6, 6, 0, 0]} name="Gross Collection" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
