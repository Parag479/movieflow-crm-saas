"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Plus,
  Search,
  Filter,
  Tv2,
  Building2,
  Film,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  MapPin,
  Calendar,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ScreenTrackingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drilldown" | "movies" | "theaters" | "missing">("drilldown");

  // Filters
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter option lists
  const [moviesList, setMoviesList] = useState<any[]>([]);
  const [distributorsList, setDistributorsList] = useState<any[]>([]);
  const [theatersList, setTheatersList] = useState<any[]>([]);

  // Add Collection Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalMovieId, setModalMovieId] = useState("");
  const [modalDistId, setModalDistId] = useState("");
  const [modalTheaterId, setModalTheaterId] = useState("");
  const [modalScreenId, setModalScreenId] = useState("");
  const [modalDate, setModalDate] = useState(new Date().toISOString().split("T")[0]);
  const [modalShows, setModalShows] = useState("4");
  const [modalGross, setModalGross] = useState("450000");
  const [modalGstRate, setModalGstRate] = useState("18");
  const [modalDeductions, setModalDeductions] = useState("9000");
  const [modalDistSharePct, setModalDistSharePct] = useState("50");
  const [modalAdmissions, setModalAdmissions] = useState("1200");
  const [modalOccupancy, setModalOccupancy] = useState("85");
  const [modalNotes, setModalNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedMovie) query.set("movieId", selectedMovie);
    if (selectedDistributor) query.set("distributorId", selectedDistributor);
    if (selectedState) query.set("state", selectedState);

    fetch(`/api/tracking/screen-drilldown?${query.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching drilldown data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [selectedMovie, selectedDistributor, selectedState]);

  useEffect(() => {
    Promise.all([
      fetch("/api/movies").then((r) => r.json()),
      fetch("/api/distributors").then((r) => r.json()),
      fetch("/api/theaters").then((r) => r.json()),
    ]).then(([mRes, dRes, tRes]) => {
      if (mRes.success) {
        setMoviesList(mRes.data);
        if (mRes.data.length > 0) setModalMovieId(mRes.data[0].id);
      }
      if (dRes.success) {
        setDistributorsList(dRes.data);
        if (dRes.data.length > 0) setModalDistId(dRes.data[0].id);
      }
      if (tRes.success) {
        setTheatersList(tRes.data);
        if (tRes.data.length > 0) {
          setModalTheaterId(tRes.data[0].id);
          if (tRes.data[0].screens?.length > 0) {
            setModalScreenId(tRes.data[0].screens[0].id);
          }
        }
      }
    });
  }, []);

  const handleTheaterChangeInModal = (thId: string) => {
    setModalTheaterId(thId);
    const th = theatersList.find((t) => t.id === thId);
    if (th && th.screens && th.screens.length > 0) {
      setModalScreenId(th.screens[0].id);
    } else {
      setModalScreenId("");
    }
  };

  const handleRecordCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: modalMovieId,
          distributorId: modalDistId,
          theaterId: modalTheaterId,
          screenId: modalScreenId || undefined,
          collectionDate: modalDate,
          shows: Number(modalShows),
          grossAmount: Number(modalGross),
          gstRate: Number(modalGstRate),
          deductions: Number(modalDeductions),
          distributorSharePct: Number(modalDistSharePct),
          admissions: Number(modalAdmissions),
          occupancyRate: Number(modalOccupancy),
          notes: modalNotes,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setShowModal(false);
        setModalNotes("");
        fetchData();
      } else {
        setErrorMessage(resData.message || "Failed to record collection");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords =
    data?.records?.filter((r: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.movieTitle.toLowerCase().includes(q) ||
        r.theaterName.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.screenName.toLowerCase().includes(q) ||
        r.distributorName.toLowerCase().includes(q)
      );
    }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-brand-950/70 border border-gray-800 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Tv2 className="w-4 h-4" />
            <span>Movie, Theatre & Screen-Wise Theatrical Box Office Tracking</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Screen & Show-Level Collection Intelligence
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm max-w-2xl">
            Granular 7-level drilldown: Distributor → Movie → State → City → Theatre → Screen → Show with occupancy analytics and missing report detection.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Screen Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-brand-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Total Gross</span>
            <div className="text-lg font-extrabold text-white">{formatCurrency(data.summary.totalGross)}</div>
            <div className="text-[10px] text-brand-400">{data.summary.totalShows} total shows</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Net Box Office</span>
            <div className="text-lg font-extrabold text-white">{formatCurrency(data.summary.totalNet)}</div>
            <div className="text-[10px] text-blue-400">Post GST/Cess</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Distributor Share</span>
            <div className="text-lg font-extrabold text-emerald-400">{formatCurrency(data.summary.totalDistributorShare)}</div>
            <div className="text-[10px] text-emerald-500 font-medium">Earned share</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Total Audience</span>
            <div className="text-lg font-extrabold text-purple-400">{data.summary.totalAdmissions.toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-purple-400">Tickets sold</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-teal-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">High Yield Screens</span>
            <div className="text-lg font-extrabold text-teal-400">{data.summary.highYieldScreensCount} Screens</div>
            <div className="text-[10px] text-teal-500 font-semibold">≥ 80% Occupancy</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-red-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Missing Reports</span>
            <div className="text-lg font-extrabold text-red-400">{data.summary.missingReportsCount} Venues</div>
            <div className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Action Needed
            </div>
          </div>
        </div>
      )}

      {/* Missing Reports Alert Banner if any */}
      {data?.missingReports?.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Missing Collection Reports Detected:</span>{" "}
              {data.missingReports.length} active screens have not submitted box office telemetry.
            </div>
          </div>
          <button
            onClick={() => setActiveTab("missing")}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px]"
          >
            Review Missing Screens
          </button>
        </div>
      )}

      {/* Filter and Tab Strip */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 border border-gray-800">
        <div className="flex items-center gap-2 border-b lg:border-b-0 border-gray-800 pb-2 lg:pb-0 text-xs font-semibold overflow-x-auto w-full lg:w-auto">
          {[
            { id: "drilldown", label: "7-Level Screen Drilldown" },
            { id: "movies", label: "Movie Cross-Comparison" },
            { id: "theaters", label: "Theatre Venue Yields" },
            { id: "missing", label: `Missing Reports (${data?.missingReports?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Select Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto justify-end">
          <input
            type="text"
            placeholder="Search movie, venue, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-500 text-xs focus:outline-none"
          />

          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-white text-xs"
          >
            <option value="">All Movies</option>
            {moviesList.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>

          <select
            value={selectedDistributor}
            onChange={(e) => setSelectedDistributor(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-white text-xs"
          >
            <option value="">All Distributors</option>
            {distributorsList.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-white text-xs"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs">Loading screen-level box office logs...</div>
      ) : activeTab === "drilldown" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Hierarchy (Distributor → Movie)</th>
                  <th className="p-4">Geography (State → City)</th>
                  <th className="p-4">Venue & Screen</th>
                  <th className="p-4">Date / Shows</th>
                  <th className="p-4">Occupancy</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Gross Collection</th>
                  <th className="p-4">Net (Post Tax)</th>
                  <th className="p-4">Distributor Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredRecords.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4">
                      <div className="font-extrabold text-white flex items-center gap-2">
                        <span>{r.movieTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 font-semibold">
                          {r.movieLanguage}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Dist: <span className="text-gray-300 font-medium">{r.distributorName}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-gray-200">{r.state}</div>
                      <div className="text-[10px] text-brand-400">{r.city}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white">{r.theaterName}</div>
                      <div className="text-[10px] text-gray-400">
                        {r.screenName} • {r.screenFormat} ({r.seatingCapacity} seats)
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white">{formatDate(r.collectionDate)}</div>
                      <div className="text-[10px] text-gray-400">{r.showsCount} shows/day</div>
                    </td>

                    <td className="p-4">
                      {r.isHighYield ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Sparkles className="w-3 h-3" /> High Yield {r.occupancyRate}%
                        </span>
                      ) : r.isLowOccupancy ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Low Occupancy {r.occupancyRate}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300">
                          {r.occupancyRate}%
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-white">{r.admissions.toLocaleString("en-IN")}</td>

                    <td className="p-4 font-bold text-white">
                      {formatCurrency(r.grossAmount)}
                    </td>

                    <td className="p-4 text-gray-200 font-medium">
                      {formatCurrency(r.netAmount)}
                    </td>

                    <td className="p-4 font-extrabold text-emerald-400">
                      {formatCurrency(r.distributorAmt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "movies" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.comparisons?.movies?.map((m: any) => (
            <div key={m.title} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <h4 className="font-extrabold text-white text-base flex items-center justify-between">
                <span>{m.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 font-mono">
                  {m.screenCount} Screens
                </span>
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Gross Collection:</span>
                  <span className="font-bold text-white">{formatCurrency(m.gross)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Net Collection:</span>
                  <span className="font-semibold text-gray-200">{formatCurrency(m.net)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Distributor Share:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(m.distShare)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Audience Attendance:</span>
                  <span className="font-bold text-purple-400">{m.admissions.toLocaleString("en-IN")} tickets</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "theaters" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4">Theatre Venue</th>
                <th className="p-4">Location</th>
                <th className="p-4">Circuit</th>
                <th className="p-4">Active Screens</th>
                <th className="p-4">Gross Collection</th>
                <th className="p-4">Distributor Share</th>
                <th className="p-4">Total Admissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {data?.comparisons?.theaters?.map((t: any) => (
                <tr key={t.name} className="hover:bg-gray-800/30">
                  <td className="p-4 font-bold text-white">{t.name}</td>
                  <td className="p-4 text-gray-300">{t.city}, {t.state}</td>
                  <td className="p-4 font-semibold text-brand-400">{t.circuit}</td>
                  <td className="p-4 font-bold text-white">{t.screenCount} screens</td>
                  <td className="p-4 font-bold text-white">{formatCurrency(t.gross)}</td>
                  <td className="p-4 font-bold text-emerald-400">{formatCurrency(t.distShare)}</td>
                  <td className="p-4 font-bold text-purple-400">{t.admissions.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Missing Reports */
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Screens with Missing Box Office Collection Reports</span>
            </h3>
          </div>
          <div className="divide-y divide-gray-800/60">
            {data?.missingReports?.map((m: any) => (
              <div key={m.screenId} className="p-4 flex items-center justify-between text-xs hover:bg-gray-800/20">
                <div>
                  <div className="font-bold text-white">{m.theaterName} — {m.screenName}</div>
                  <div className="text-[10px] text-gray-400">{m.city}, {m.state} • {m.seatingCapacity} seats</div>
                </div>
                <button
                  onClick={() => {
                    setModalTheaterId(m.theaterId || "");
                    setModalScreenId(m.screenId);
                    setShowModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px]"
                >
                  Log Collection Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-base">Record Screen-Wise Box Office Collection</h3>
                <p className="text-[11px] text-gray-400">Prevent duplicate entries & apply contractual revenue sharing</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRecordCollection} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Movie *</label>
                  <select
                    value={modalMovieId}
                    onChange={(e) => setModalMovieId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    {moviesList.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Distributor *</label>
                  <select
                    value={modalDistId}
                    onChange={(e) => setModalDistId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    {distributorsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Theatre Venue *</label>
                  <select
                    value={modalTheaterId}
                    onChange={(e) => handleTheaterChangeInModal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    {theatersList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Target Screen *</label>
                  <select
                    value={modalScreenId}
                    onChange={(e) => setModalScreenId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    {theatersList
                      .find((t) => t.id === modalTheaterId)
                      ?.screens?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.screenFormat} • {s.seatingCapacity} seats)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Show Date *</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Shows / Day</label>
                  <input
                    type="number"
                    value={modalShows}
                    onChange={(e) => setModalShows(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Occupancy %</label>
                  <input
                    type="number"
                    value={modalOccupancy}
                    onChange={(e) => setModalOccupancy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Gross Collection (INR) *</label>
                  <input
                    type="number"
                    value={modalGross}
                    onChange={(e) => setModalGross(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white font-mono text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Audience / Tickets Sold *</label>
                  <input
                    type="number"
                    value={modalAdmissions}
                    onChange={(e) => setModalAdmissions(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">GST Rate (%)</label>
                  <input
                    type="number"
                    value={modalGstRate}
                    onChange={(e) => setModalGstRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Deductions (INR)</label>
                  <input
                    type="number"
                    value={modalDeductions}
                    onChange={(e) => setModalDeductions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Distributor Share %</label>
                  <input
                    type="number"
                    value={modalDistSharePct}
                    onChange={(e) => setModalDistSharePct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Remarks / Validation Notes</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Weekend evening blockbuster show verified"
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md"
                >
                  {submitting ? "Checking & Saving..." : "Log & Verify Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
