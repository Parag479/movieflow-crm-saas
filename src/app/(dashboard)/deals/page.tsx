"use client";

import React, { useState, useEffect } from "react";
import { FileCheck2, Plus, Search, FileText, CheckCircle2, Download, Printer, ShieldCheck, X, Sparkles } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewAgreement, setPreviewAgreement] = useState<any>(null);

  // New Deal form state
  const [movieId, setMovieId] = useState("");
  const [theaterId, setTheaterId] = useState("");
  const [distributorId, setDistributorId] = useState("");
  const [agreementType, setAgreementType] = useState("REVENUE_SHARE");
  const [mgAmount, setMgAmount] = useState("500000");
  const [revenueSharePercent, setRevenueSharePercent] = useState("55");
  const [territory, setTerritory] = useState("Mumbai Circuit");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [dRes, mRes, tRes, distRes] = await Promise.all([
        fetch("/api/deals").then((r) => r.json()),
        fetch("/api/movies").then((r) => r.json()),
        fetch("/api/theaters").then((r) => r.json()),
        fetch("/api/distributors").then((r) => r.json()),
      ]);

      if (dRes.success) setDeals(dRes.data);
      if (mRes.success) setMovies(mRes.data);
      if (tRes.success) setTheaters(tRes.data);
      if (distRes.success) setDistributors(distRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movieId || movies[0]?.id,
          theaterId: theaterId || theaters[0]?.id,
          distributorId: distributorId || distributors[0]?.id,
          agreementType,
          mgAmount,
          revenueSharePercent,
          territory,
        }),
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

  const filteredDeals = deals.filter(
    (d) =>
      d.dealNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.movie?.title.toLowerCase().includes(search.toLowerCase()) ||
      d.theater?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-brand-500" />
            <span>Deals & Digital Agreement Contracts</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Structure Minimum Guarantee (MG) deals, percentage revenue splits, and automated PDF contract generation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Execute New Deal Contract</span>
        </button>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search deal #, movie, or theater..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      {/* Deals Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 font-semibold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Deal Ref</th>
              <th className="p-4">Movie & Theater</th>
              <th className="p-4">Terms & Revenue Share</th>
              <th className="p-4">Minimum Guarantee</th>
              <th className="p-4">Territory</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">PDF Contract</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {filteredDeals.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40">
                <td className="p-4 font-mono font-bold text-brand-500">
                  {d.dealNumber}
                </td>
                <td className="p-4">
                  <div className="font-extrabold text-gray-900 dark:text-white">{d.movie?.title}</div>
                  <div className="text-[10px] text-gray-400">{d.theater?.name} ({d.theater?.city})</div>
                </td>
                <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                  {d.revenueSharePercent}% Share ({d.agreementType.replace("_", " ")})
                </td>
                <td className="p-4 font-extrabold text-emerald-500">
                  {formatCurrency(d.mgAmount)}
                </td>
                <td className="p-4 text-gray-500">{d.territory}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{d.status}</span>
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setPreviewAgreement(d)}
                    className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white font-bold transition flex items-center gap-1.5 ml-auto"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Contract Preview Modal */}
      {previewAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Official Legal Document</span>
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">
                  Movie Distribution Agreement #{previewAgreement.agreements?.[0]?.agreementNumber || "AGR-2026-001"}
                </h3>
              </div>
              <button onClick={() => setPreviewAgreement(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Document Mock */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-4 text-xs font-serif leading-relaxed text-gray-800 dark:text-gray-200">
              <div className="text-center font-bold uppercase tracking-widest border-b border-gray-300 dark:border-gray-800 pb-3">
                Commercial Exhibition & Distribution Rights Contract
              </div>

              <p>
                This Distribution Agreement is entered into on <strong>{formatDate(new Date())}</strong> between:
              </p>

              <div className="grid grid-cols-2 gap-4 font-sans bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Party A (Distributor)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{previewAgreement.distributor?.name || "Warner Bros India"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Party B (Theater Exhibitor)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{previewAgreement.theater?.name}</span>
                </div>
              </div>

              <div className="space-y-1 font-sans">
                <p className="font-bold">Subject Film: {previewAgreement.movie?.title}</p>
                <p>Territory Rights: {previewAgreement.territory}</p>
                <p>Minimum Guarantee (MG): <strong>{formatCurrency(previewAgreement.mgAmount)}</strong></p>
                <p>Week 1 Revenue Share Split: <strong>{previewAgreement.revenueSharePercent}% Distributor / {100 - previewAgreement.revenueSharePercent}% Exhibitor</strong></p>
              </div>

              <p className="text-[11px] text-gray-500 italic pt-2 border-t border-gray-200 dark:border-gray-800">
                Terms: Net box office earnings after deduction of applicable GST taxes shall be remitted weekly to the designated bank account within 7 working days.
              </p>

              <div className="pt-6 flex justify-between items-center font-sans border-t border-gray-300 dark:border-gray-800">
                <div className="text-center">
                  <div className="w-32 h-10 border-b border-dashed border-gray-400 flex items-center justify-center font-script text-brand-500 font-bold">
                    Digitally Signed
                  </div>
                  <span className="text-[10px] text-gray-400">Distributor Signatory</span>
                </div>
                <div className="text-center">
                  <div className="w-32 h-10 border-b border-dashed border-gray-400 flex items-center justify-center font-script text-brand-500 font-bold">
                    Digitally Signed
                  </div>
                  <span className="text-[10px] text-gray-400">Exhibitor Signatory</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 font-sans">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Contract</span>
              </button>
              <button
                onClick={() => alert("Agreement PDF Downloaded!")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Verified PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Structure Deal Agreement
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Select Movie</label>
                <select
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} ({m.language})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Select Theater</label>
                <select
                  value={theaterId}
                  onChange={(e) => setTheaterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  {theaters.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Minimum Guarantee (₹)</label>
                  <input
                    type="number"
                    value={mgAmount}
                    onChange={(e) => setMgAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Revenue Share %</label>
                  <input
                    type="number"
                    value={revenueSharePercent}
                    onChange={(e) => setRevenueSharePercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Territory Circuit</label>
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  placeholder="e.g. Mumbai Circuit / Pan India"
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
                  {creating ? "Executing..." : "Execute & Generate Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
