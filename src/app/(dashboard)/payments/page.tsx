"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Search, FileText, CheckCircle2, Download, Printer, Landmark, ShieldCheck, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  // New Invoice form state
  const [dealId, setDealId] = useState("");
  const [amountBeforeTax, setAmountBeforeTax] = useState("1000000");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [iRes, dRes] = await Promise.all([
        fetch("/api/payments").then((r) => r.json()),
        fetch("/api/deals").then((r) => r.json()),
      ]);
      if (iRes.success) setInvoices(iRes.data);
      if (dRes.success) setDeals(dRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: dealId || deals[0]?.id, amountBeforeTax }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.deal?.movie?.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalCgst = invoices.reduce((sum, inv) => sum + (inv.cgstAmount || 0), 0);
  const totalSgst = invoices.reduce((sum, inv) => sum + (inv.sgstAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-500" />
            <span>Payments, GST Tax Invoices & Ledger</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Financial ledger, milestone payments, CGST/SGST calculations, and automated tax invoices.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Tax Invoice</span>
        </button>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">Total Invoiced Amount</span>
          <p className="text-xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">CGST Collected (9%)</span>
          <p className="text-xl font-extrabold text-emerald-500">{formatCurrency(totalCgst)}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">SGST Collected (9%)</span>
          <p className="text-xl font-extrabold text-emerald-500">{formatCurrency(totalSgst)}</p>
        </div>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search invoice # or movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      {/* Invoices Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 font-semibold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Movie & Theater</th>
              <th className="p-4">Subtotal</th>
              <th className="p-4">CGST + SGST (18%)</th>
              <th className="p-4">Total Tax Invoice</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Invoice PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40">
                <td className="p-4 font-mono font-bold text-brand-500">
                  {inv.invoiceNumber}
                </td>
                <td className="p-4">
                  <div className="font-extrabold text-gray-900 dark:text-white">{inv.deal?.movie?.title}</div>
                  <div className="text-[10px] text-gray-400">{inv.deal?.theater?.name}</div>
                </td>
                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                  {formatCurrency(inv.amountBeforeTax)}
                </td>
                <td className="p-4 text-emerald-500 font-medium">
                  +{formatCurrency((inv.cgstAmount || 0) + (inv.sgstAmount || 0))}
                </td>
                <td className="p-4 font-extrabold text-gray-900 dark:text-white">
                  {formatCurrency(inv.totalAmount)}
                </td>
                <td className="p-4 font-mono text-gray-400">{formatDate(inv.dueDate)}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500">
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setPreviewInvoice(inv)}
                    className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white font-bold transition flex items-center gap-1.5 ml-auto"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax Invoice Modal Preview */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Tax Invoice (Rule 46 GST Act)</span>
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">
                  Invoice #{previewInvoice.invoiceNumber}
                </h3>
              </div>
              <button onClick={() => setPreviewInvoice(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Metro Cinema Group</span>
                  <p className="text-[10px] text-gray-400">GSTIN: 27AAACM1234F1Z9</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-white">Date: {formatDate(previewInvoice.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-1 font-sans">
                <p className="text-[11px] text-gray-400">Billed To:</p>
                <p className="font-bold text-gray-900 dark:text-white">{previewInvoice.deal?.theater?.name}</p>
                <p className="text-gray-500">{previewInvoice.deal?.theater?.address}</p>
              </div>

              <table className="w-full border-t border-b border-gray-200 dark:border-gray-800 py-2">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="py-2">Box Office Revenue Share Split ('{previewInvoice.deal?.movie?.title}')</td>
                    <td className="py-2 text-right font-bold">{formatCurrency(previewInvoice.amountBeforeTax)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-400">Central GST (CGST @ 9%)</td>
                    <td className="py-2 text-right font-bold text-emerald-500">+{formatCurrency(previewInvoice.cgstAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-400">State GST (SGST @ 9%)</td>
                    <td className="py-2 text-right font-bold text-emerald-500">+{formatCurrency(previewInvoice.sgstAmount)}</td>
                  </tr>
                  <tr className="font-extrabold text-sm border-t border-gray-300 dark:border-gray-700">
                    <td className="py-3">Grand Total Payable</td>
                    <td className="py-3 text-right text-brand-500">{formatCurrency(previewInvoice.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Generate Tax Invoice
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Target Executed Deal</label>
                <select
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>{d.dealNumber} - {d.movie?.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Base Amount Before Tax (₹)</label>
                <input
                  type="number"
                  value={amountBeforeTax}
                  onChange={(e) => setAmountBeforeTax(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md"
                >
                  {creating ? "Calculating..." : "Compute 18% GST & Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
