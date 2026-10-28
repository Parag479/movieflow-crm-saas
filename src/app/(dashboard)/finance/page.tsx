"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Receipt, Plus, DollarSign, CheckCircle2, AlertCircle, FileCheck2, CreditCard, Truck, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinancePage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"settlements" | "expenses" | "ledgers">("settlements");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/finance/settlements").then((r) => r.json()),
      fetch("/api/finance/expenses").then((r) => r.json()),
      fetch("/api/distributors").then((r) => r.json()),
    ])
      .then(([sRes, eRes, dRes]) => {
        if (sRes.success) setSettlements(sRes.data);
        if (eRes.success) setExpenses(eRes.data);
        if (dRes.success) setDistributors(dRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-500" />
            <span>Finance, Settlements & Distributor Ledgers</span>
          </h1>
          <p className="text-xs text-gray-400">
            Manage weekly exhibitor/distributor settlements, GST deductions, TDS accounting, distributor double-entry ledgers, and outstanding receivables.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-800 pb-3 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("settlements")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === "settlements"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Weekly Theatrical Settlements ({settlements.length})
        </button>
        <button
          onClick={() => setActiveTab("ledgers")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === "ledgers"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Distributor Ledgers & Receivables ({distributors.length})
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === "expenses"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          P&A Distribution Expenses ({expenses.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 text-xs">Loading financial ledgers & settlements...</div>
      ) : activeTab === "settlements" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Movie</th>
                  <th className="px-6 py-4">Territory</th>
                  <th className="px-6 py-4">Week</th>
                  <th className="px-6 py-4">Gross Collection</th>
                  <th className="px-6 py-4">Distributor Share</th>
                  <th className="px-6 py-4">GST (18%)</th>
                  <th className="px-6 py-4">TDS (2%)</th>
                  <th className="px-6 py-4">Net Payable</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4 font-bold text-white font-sans">{s.movieTitle}</td>
                    <td className="px-6 py-4 font-semibold text-brand-400 font-sans">{s.territory}</td>
                    <td className="px-6 py-4 font-sans">Week {s.week}</td>
                    <td className="px-6 py-4 font-bold text-white">{formatCurrency(s.grossCollection)}</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{formatCurrency(s.distributorAmt)}</td>
                    <td className="px-6 py-4 text-gray-400">{formatCurrency(s.gstAmount)}</td>
                    <td className="px-6 py-4 text-gray-400">{formatCurrency(s.tdsAmount)}</td>
                    <td className="px-6 py-4 font-bold text-amber-400">{formatCurrency(s.netPayable)}</td>
                    <td className="px-6 py-4 font-sans">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          s.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "ledgers" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Distributor Company</th>
                  <th className="px-6 py-4">Territory</th>
                  <th className="px-6 py-4">Total Invoiced (Debits)</th>
                  <th className="px-6 py-4">Total Received (Credits)</th>
                  <th className="px-6 py-4">Closing Balance</th>
                  <th className="px-6 py-4">Overdue Dues</th>
                  <th className="px-6 py-4 text-right">Ledger Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {distributors.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4 font-sans">
                      <div className="font-extrabold text-white">{d.name}</div>
                      <div className="text-[10px] text-brand-400 font-mono">{d.code}</div>
                    </td>
                    <td className="px-6 py-4 font-sans text-gray-300">{d.territory}</td>
                    <td className="px-6 py-4 font-bold text-white">{formatCurrency(d.totalBilled)}</td>
                    <td className="px-6 py-4 font-bold text-teal-400">{formatCurrency(d.totalReceived)}</td>
                    <td className="px-6 py-4 font-extrabold text-amber-400">{formatCurrency(d.outstandingBalance)}</td>
                    <td className="px-6 py-4">
                      {d.overdueAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 font-sans">
                          Overdue: {formatCurrency(d.overdueAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-500">₹0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-sans">
                      <Link
                        href={`/distributors/${d.id}?tab=ledger`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white font-bold transition text-[11px]"
                      >
                        <span>View Ledger</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Movie</th>
                  <th className="px-6 py-4">Expense Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Territory</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4 font-bold text-white font-sans">{e.movie?.title}</td>
                    <td className="px-6 py-4 font-semibold text-brand-400 font-sans">{e.category}</td>
                    <td className="px-6 py-4 text-gray-300 font-sans">{e.description}</td>
                    <td className="px-6 py-4 text-gray-400 font-sans">{e.territory}</td>
                    <td className="px-6 py-4 font-bold text-red-400">{formatCurrency(e.amount)}</td>
                    <td className="px-6 py-4 font-sans">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
