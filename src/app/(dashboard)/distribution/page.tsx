"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, MapPin, Building2, Tv2, DollarSign, TrendingUp, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DistributionPage() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    movieId: "",
    territoryId: "",
    totalScreens: 500,
    totalTheatres: 120,
    printsCost: 20000000,
    pubCost: 30000000,
    distributorSharePct: 50,
    exhibitorSharePct: 50,
    releaseDate: "2026-08-15",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [distRes, movRes, terrRes] = await Promise.all([
        fetch("/api/distributions").then((r) => r.json()),
        fetch("/api/movies").then((r) => r.json()),
        fetch("/api/territories").then((r) => r.json()),
      ]);

      if (distRes.success) setDistributions(distRes.data);
      if (movRes.success) setMovies(movRes.data);
      if (terrRes.success) setTerritories(terrRes.data);

      if (movRes.data?.length) setFormData((prev) => ({ ...prev, movieId: movRes.data[0].id }));
      if (terrRes.data?.length) setFormData((prev) => ({ ...prev, territoryId: terrRes.data[0].id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" />
            <span>Distribution Management Hub</span>
          </h1>
          <p className="text-xs text-gray-400">
            Assign movies to cities and territories (Mumbai, North India, South India, Overseas), track theatre/screen allocations, distribution cost, and share split.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Territory Distribution</span>
        </button>
      </div>

      {/* Distribution Cards List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading distribution matrix...</div>
      ) : (
        <div className="space-y-4">
          {distributions.map((d) => {
            const netProfit = d.distributorShare - d.distributionCost;
            return (
              <div key={d.id} className="glass-panel p-6 rounded-3xl space-y-4 border border-gray-800 bg-gray-900/80 hover:border-brand-500/40 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-sm">
                      {d.territory?.code || "MUM"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{d.movie?.title}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                          {d.territory?.name}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Released: {new Date(d.releaseDate).toLocaleDateString()} • Region: {d.territory?.region}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-gray-500 uppercase font-semibold text-[10px]">Screens</span>
                      <div className="font-extrabold text-white text-base">{d.totalScreens}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase font-semibold text-[10px]">Theatres</span>
                      <div className="font-extrabold text-white text-base">{d.totalTheatres}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase font-semibold text-[10px]">Occupancy</span>
                      <div className="font-extrabold text-emerald-400 text-base">{d.occupancyRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Financial Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Dist. Cost</span>
                    <div className="font-bold text-red-400 text-sm mt-0.5">{formatCurrency(d.distributionCost)}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Gross Collection</span>
                    <div className="font-bold text-blue-400 text-sm mt-0.5">{formatCurrency(d.grossCollection)}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Distributor Share ({d.distributorSharePct}%)</span>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">{formatCurrency(d.distributorShare)}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Net Profit</span>
                    <div className={`font-bold text-sm mt-0.5 ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(netProfit)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Distribution Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl space-y-4 border border-gray-800 bg-gray-900 text-white">
            <h2 className="text-lg font-bold">Assign Movie to Territory</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-400">Select Movie</label>
                <select
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-400">Select Territory / Circuit</label>
                <select
                  value={formData.territoryId}
                  onChange={(e) => setFormData({ ...formData, territoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                >
                  {territories.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.region})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-400">Total Screens</label>
                  <input
                    type="number"
                    value={formData.totalScreens}
                    onChange={(e) => setFormData({ ...formData, totalScreens: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-400">Total Theatres</label>
                  <input
                    type="number"
                    value={formData.totalTheatres}
                    onChange={(e) => setFormData({ ...formData, totalTheatres: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-400">Prints Cost (INR)</label>
                  <input
                    type="number"
                    value={formData.printsCost}
                    onChange={(e) => setFormData({ ...formData, printsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-400">Publicity Cost (INR)</label>
                  <input
                    type="number"
                    value={formData.pubCost}
                    onChange={(e) => setFormData({ ...formData, pubCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl font-semibold text-gray-400 hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-500">
                  {submitting ? "Saving..." : "Save Distribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
