"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Clock,
  Coins,
  Receipt,
  Tv2,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<
    "outstanding" | "state-pending" | "screen-collections" | "overdue-reminders" | "monthly-pnl"
  >("outstanding");
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/reports/distributor-analytics?type=${reportType}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          if (Array.isArray(resData.data)) {
            setData(resData.data);
            setSummary(null);
          } else {
            setData([]);
            setSummary(resData.data?.summary || null);
          }
        }
      })
      .catch((err) => console.error("Error fetching report:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    window.open(`/api/reports/distributor-analytics?type=${reportType}&format=csv`, "_blank");
  };

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            <span>Distribution Reports, Audits & Exporter Hub</span>
          </h1>
          <p className="text-xs text-gray-400">
            Export filtered distributor receivables, state pending payments, screen collections, overdue reminders, and monthly P&L.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel/CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition border border-gray-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-xs font-semibold overflow-x-auto print:hidden">
        {[
          { id: "outstanding", label: "Distributor-Wise Outstanding" },
          { id: "state-pending", label: "State-Wise Pending Payments" },
          { id: "screen-collections", label: "Movie & Screen Collections" },
          { id: "overdue-reminders", label: "Overdue Invoices & Reminders" },
          { id: "monthly-pnl", label: "Monthly P&L Reconciliation" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              reportType === tab.id
                ? "bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar for tabular reports */}
      {reportType !== "monthly-pnl" && (
        <div className="glass-panel p-3 rounded-2xl flex items-center justify-between border border-gray-800 print:hidden">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in this report..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-800 bg-gray-900 text-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-gray-400">{filteredData.length} records</span>
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs">Generating verified financial audit report...</div>
      ) : reportType === "outstanding" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4">Distributor</th>
                <th className="p-4">Territory</th>
                <th className="p-4">Total Invoiced</th>
                <th className="p-4">Total Received</th>
                <th className="p-4">Outstanding Balance</th>
                <th className="p-4">Overdue Amount</th>
                <th className="p-4">Upcoming Due</th>
                <th className="p-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filteredData.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="p-4 font-sans">
                    <span className="font-bold text-white block">{r.distributorName}</span>
                    <span className="text-[10px] text-brand-400">{r.distributorCode}</span>
                  </td>
                  <td className="p-4 font-sans text-gray-300">{r.territory}</td>
                  <td className="p-4 text-white font-bold">{formatCurrency(r.totalInvoiced)}</td>
                  <td className="p-4 text-teal-400 font-bold">{formatCurrency(r.totalReceived)}</td>
                  <td className="p-4 text-amber-400 font-extrabold">{formatCurrency(r.outstandingBalance)}</td>
                  <td className="p-4 text-red-400 font-bold">{formatCurrency(r.overdueAmount)}</td>
                  <td className="p-4 text-gray-300">{formatCurrency(r.upcomingDue)}</td>
                  <td className="p-4 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "SETTLED"
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                        : r.overdueAmount > 0
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : reportType === "state-pending" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4">State</th>
                <th className="p-4">Gross Collection</th>
                <th className="p-4">Distributor Share</th>
                <th className="p-4">Estimated Received</th>
                <th className="p-4">Pending Settlement</th>
                <th className="p-4">Overdue Dues</th>
                <th className="p-4">Footfall / Audience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filteredData.map((s: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="p-4 font-sans font-bold text-white">{s.state}</td>
                  <td className="p-4 font-bold text-white">{formatCurrency(s.grossCollection)}</td>
                  <td className="p-4 text-emerald-400 font-bold">{formatCurrency(s.distributorShare)}</td>
                  <td className="p-4 text-teal-400 font-bold">{formatCurrency(s.estimatedReceived)}</td>
                  <td className="p-4 text-amber-400 font-semibold">{formatCurrency(s.pendingAmount)}</td>
                  <td className="p-4 text-red-400 font-bold">{formatCurrency(s.overdueAmount)}</td>
                  <td className="p-4 text-purple-400 font-sans">{s.totalAudience?.toLocaleString("en-IN")} tickets</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : reportType === "screen-collections" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4">Movie & Distributor</th>
                <th className="p-4">Theatre Venue & Screen</th>
                <th className="p-4">Date / Shows</th>
                <th className="p-4">Occupancy</th>
                <th className="p-4">Tickets</th>
                <th className="p-4">Gross</th>
                <th className="p-4">Net</th>
                <th className="p-4">Distributor Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filteredData.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="p-4 font-sans">
                    <span className="font-bold text-white block">{c.movieTitle}</span>
                    <span className="text-[10px] text-gray-400">Dist: {c.distributor}</span>
                  </td>
                  <td className="p-4 font-sans">
                    <span className="text-gray-200 block">{c.theaterName}</span>
                    <span className="text-[10px] text-brand-400">{c.screenName} ({c.format}) • {c.city}</span>
                  </td>
                  <td className="p-4 font-sans text-gray-300">
                    <div>{c.date}</div>
                    <div className="text-[10px] text-gray-500">{c.shows} shows</div>
                  </td>
                  <td className="p-4 font-sans">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-bold">
                      {c.occupancy}
                    </span>
                  </td>
                  <td className="p-4 text-white font-sans">{c.ticketsSold?.toLocaleString("en-IN")}</td>
                  <td className="p-4 font-bold text-white">{formatCurrency(c.gross)}</td>
                  <td className="p-4 text-gray-300">{formatCurrency(c.net)}</td>
                  <td className="p-4 font-bold text-emerald-400">{formatCurrency(c.distributorShare)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : reportType === "overdue-reminders" ? (
        <div className="space-y-3">
          {filteredData.map((inv: any) => (
            <div
              key={inv.invoiceNumber}
              className={`glass-panel p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                inv.isOverdue ? "border-red-800/60 bg-red-950/20" : "border-gray-800"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-mono">{inv.invoiceNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.isOverdue
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {inv.isOverdue ? `${inv.daysOverdue} Days Overdue` : "Payment Due"}
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  Distributor: <span className="font-bold text-white">{inv.distributorName}</span> ({inv.distributorEmail})
                </div>
                <div className="text-xs text-gray-400">{inv.reminderMessage}</div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Pending Balance</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {formatCurrency(inv.balanceAmount)}
                </span>
                <div className="text-[10px] text-gray-500 font-sans">Total Invoiced: {formatCurrency(inv.totalAmount)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Monthly P&L Reconciliation */
        summary && (
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
            <h3 className="font-bold text-base text-white border-b border-gray-800 pb-3">
              Monthly P&L & Theatrical Settlement Reconciliation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">Gross Box Office</span>
                <span className="text-base font-bold text-white">{formatCurrency(summary.totalGross)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">GST (18% Statutory)</span>
                <span className="text-base font-bold text-gray-300">{formatCurrency(summary.totalGst)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">Net Box Office</span>
                <span className="text-base font-bold text-blue-400">{formatCurrency(summary.totalNet)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">Distributor Share</span>
                <span className="text-base font-bold text-emerald-400">{formatCurrency(summary.totalDistShare)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">Total Invoiced</span>
                <span className="text-base font-bold text-amber-400">{formatCurrency(summary.totalInvoiced)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">Total Received</span>
                <span className="text-base font-bold text-teal-400">{formatCurrency(summary.totalReceived)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">P&A Expenses</span>
                <span className="text-base font-bold text-red-400">{formatCurrency(summary.totalExpenses)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block font-sans">Net P&L Profit</span>
                <span className="text-base font-extrabold text-teal-400">{formatCurrency(summary.netProfit)}</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
