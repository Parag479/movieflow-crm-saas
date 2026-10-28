"use client";

import React, { useState, useEffect } from "react";
import IndiaMap, { StateOrCityData } from "@/components/IndiaMap";
import {
  MapPin,
  Filter,
  Film,
  Building2,
  Tv2,
  TrendingUp,
  Receipt,
  CreditCard,
  Coins,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function InteractiveMapPage() {
  const [statesData, setStatesData] = useState<StateOrCityData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedStateItem, setSelectedStateItem] = useState<StateOrCityData | null>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail Modal when state row is clicked
  const [detailModalState, setDetailModalState] = useState<any | null>(null);

  const fetchStateData = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedMovie) query.set("movieId", selectedMovie);
    if (selectedDistributor) query.set("distributorId", selectedDistributor);

    fetch(`/api/financials/state-wise?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatesData(data.data);
          setSummary(data.summary);
          if (data.data.length > 0 && !selectedStateItem) {
            setSelectedStateItem(data.data[0]);
          }
        }
      })
      .catch((err) => console.error("Error fetching state financials:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/movies").then((r) => r.json()),
      fetch("/api/distributors").then((r) => r.json()),
    ]).then(([mRes, dRes]) => {
      if (mRes.success) setMovies(mRes.data);
      if (dRes.success) setDistributors(dRes.data);
    });
  }, []);

  useEffect(() => {
    fetchStateData();
  }, [selectedMovie, selectedDistributor]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-brand-950/70 border border-gray-800 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Pan-India State-Wise Theatrical Collections & Financial Settlements</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Clickable State-Wise Financial Command Dashboard
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm max-w-2xl">
            Live box office telemetry, distributor/exhibitor shares, and pending payment reconciliation mapped across every Indian state and distribution circuit.
          </p>
        </div>

        {/* Global Multi-Filters */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-2xl border border-gray-800">
            <Film className="w-4 h-4 text-brand-400" />
            <select
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none"
            >
              <option value="" className="bg-gray-900">All Movies</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id} className="bg-gray-900">{m.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-2xl border border-gray-800">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedDistributor}
              onChange={(e) => setSelectedDistributor(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none"
            >
              <option value="" className="bg-gray-900">All Distributors</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id} className="bg-gray-900">{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-brand-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Gross Collection</span>
            <div className="text-lg font-extrabold text-white">{formatCurrency(summary.totalGross)}</div>
            <div className="text-[10px] text-brand-400">{summary.totalStates} active states</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Net Collection</span>
            <div className="text-lg font-extrabold text-white">{formatCurrency(summary.totalNet)}</div>
            <div className="text-[10px] text-blue-400">Post GST/Cess</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Distributor Share</span>
            <div className="text-lg font-extrabold text-emerald-400">{formatCurrency(summary.totalDistributorShare)}</div>
            <div className="text-[10px] text-emerald-500 font-medium">National share</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-teal-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Payments Received</span>
            <div className="text-lg font-extrabold text-teal-400">{formatCurrency(summary.totalReceived)}</div>
            <div className="text-[10px] text-teal-500 font-medium">Cleared cash</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Pending Amount</span>
            <div className="text-lg font-extrabold text-amber-400">{formatCurrency(summary.totalPending)}</div>
            <div className="text-[10px] text-amber-500">In settlement cycle</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-red-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Overdue Amount</span>
            <div className="text-lg font-extrabold text-red-400">{formatCurrency(summary.totalOverdue)}</div>
            <div className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Overdue alerts
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Audience</span>
            <div className="text-lg font-extrabold text-purple-400">{summary.totalAudience.toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-purple-400">Total footfall</div>
          </div>
        </div>
      )}

      {/* Interactive Map */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs">Loading Pan-India GIS telemetry...</div>
      ) : (
        <IndiaMap
          items={statesData}
          selectedItem={selectedStateItem}
          onSelectItem={(item) => setSelectedStateItem(item)}
          title="Interactive Pan-India Theatrical Distribution Telemetry Map"
          subtitle="Click any state marker on the map or click any state row in the table below to inspect live cities, venues, collections & pending dues."
        />
      )}

      {/* State-Wise Financial Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">State-Wise Financial Performance & Settlement Table</h3>
            <p className="text-xs text-gray-400">Click any row to open the complete city and venue-level drilldown drawer.</p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">State</th>
                  <th className="p-4">Active Dist.</th>
                  <th className="p-4">Theatres & Screens</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Gross Collection</th>
                  <th className="p-4">Net (Post Tax)</th>
                  <th className="p-4">Distributor Share</th>
                  <th className="p-4">Received</th>
                  <th className="p-4">Pending</th>
                  <th className="p-4">Overdue</th>
                  <th className="p-4">Net Profit</th>
                  <th className="p-4 text-right">Drill Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {statesData.map((s: any) => (
                  <tr
                    key={s.state}
                    onClick={() => setDetailModalState(s)}
                    className="hover:bg-gray-800/40 transition cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="font-extrabold text-white group-hover:text-brand-400 transition flex items-center gap-2">
                        <span>{s.state}</span>
                        {s.code && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 font-mono">
                            {s.code}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-gray-300">
                      {s.activeDistributorsCount} Firms
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{s.screensCount} Screens</div>
                      <div className="text-[10px] text-gray-400">{s.theatersCount} Venues</div>
                    </td>

                    <td className="p-4 font-bold text-purple-400">
                      {s.audienceAttendance.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 font-bold text-white">
                      {formatCurrency(s.grossCollection)}
                    </td>

                    <td className="p-4 font-semibold text-gray-200">
                      {formatCurrency(s.netCollection)}
                    </td>

                    <td className="p-4 font-extrabold text-emerald-400">
                      {formatCurrency(s.distributorShare)}
                    </td>

                    <td className="p-4 font-bold text-teal-400">
                      {formatCurrency(s.paymentsReceived)}
                    </td>

                    <td className="p-4 font-semibold text-amber-400">
                      {formatCurrency(s.pendingAmount)}
                    </td>

                    <td className="p-4">
                      {s.overdueAmount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                          {formatCurrency(s.overdueAmount)}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-mono">₹0</span>
                      )}
                    </td>

                    <td className="p-4 font-extrabold text-teal-400">
                      {formatCurrency(s.netProfit)}
                    </td>

                    <td className="p-4 text-right">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-400 font-bold text-[11px] hover:bg-brand-500 hover:text-white transition">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* State Detail Drilldown Modal */}
      {detailModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  Territory & State Breakdown
                </span>
                <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                  <span>{detailModalState.state}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                    {detailModalState.code}
                  </span>
                </h3>
              </div>
              <button onClick={() => setDetailModalState(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block">Gross Box Office</span>
                <span className="text-base font-extrabold text-white">{formatCurrency(detailModalState.grossCollection)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block">Distributor Share</span>
                <span className="text-base font-extrabold text-emerald-400">{formatCurrency(detailModalState.distributorShare)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block">Payments Received</span>
                <span className="text-base font-extrabold text-teal-400">{formatCurrency(detailModalState.paymentsReceived)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800">
                <span className="text-gray-500 block">Outstanding Due</span>
                <span className="text-base font-extrabold text-amber-400">{formatCurrency(detailModalState.pendingAmount + detailModalState.overdueAmount)}</span>
              </div>
            </div>

            {/* Major Cities List in State */}
            {detailModalState.cities && detailModalState.cities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  City-Wise Collections in {detailModalState.state}
                </h4>
                <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-950 text-gray-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">City</th>
                        <th className="p-3">Theatres</th>
                        <th className="p-3">Screens</th>
                        <th className="p-3">Gross Collection</th>
                        <th className="p-3 text-right">Distributor Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {detailModalState.cities.map((c: any) => (
                        <tr key={c.city}>
                          <td className="p-3 font-bold text-white">{c.city}</td>
                          <td className="p-3">{c.theatersCount} venues</td>
                          <td className="p-3 font-semibold text-brand-400">{c.screensCount} screens</td>
                          <td className="p-3 font-bold text-white">{formatCurrency(c.gross)}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">{formatCurrency(c.distShare)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Theatres in State */}
            {detailModalState.theaters && detailModalState.theaters.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Active Theatres in {detailModalState.state}
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {detailModalState.theaters.map((t: any) => (
                    <div key={t.id} className="p-3 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-gray-400">{t.city} • {t.circuit} • {t.screens} screens ({t.capacity} seats)</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                        Active Venue
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
