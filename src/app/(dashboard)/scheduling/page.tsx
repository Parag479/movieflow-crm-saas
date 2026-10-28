"use client";

import React, { useState, useEffect } from "react";
import { CalendarDays, Plus, AlertTriangle, CheckCircle2, Clock, Film, Tv2, X, ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SchedulingPage() {
  const [shows, setShows] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [conflictError, setConflictError] = useState("");

  // Form state
  const [movieId, setMovieId] = useState("");
  const [screenId, setScreenId] = useState("");
  const [showDate, setShowDate] = useState("2026-07-25");
  const [startTime, setStartTime] = useState("14:30");
  const [endTime, setEndTime] = useState("17:30");
  const [ticketPriceStandard, setTicketPriceStandard] = useState("300");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [sRes, mRes, tRes] = await Promise.all([
        fetch("/api/shows").then((r) => r.json()),
        fetch("/api/movies").then((r) => r.json()),
        fetch("/api/theaters").then((r) => r.json()),
      ]);

      if (sRes.success) setShows(sRes.data);
      if (mRes.success) setMovies(mRes.data);
      if (tRes.success) setTheaters(tRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setConflictError("");

    const targetMovieId = movieId || movies[0]?.id;
    const targetScreenId = screenId || theaters[0]?.screens?.[0]?.id;

    try {
      const res = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: targetMovieId,
          screenId: targetScreenId,
          showDate,
          startTime,
          endTime,
          ticketPriceStandard,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setConflictError(data.message || "Conflict detected! Screen is busy.");
      } else {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      setConflictError("Failed to communicate with conflict engine");
    } finally {
      setCreating(false);
    }
  };

  // Group screens
  const allScreens = theaters.flatMap((t) =>
    (t.screens || []).map((s: any) => ({ ...s, theaterName: t.name }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-500" />
            <span>Show Scheduling & Screen Conflict Detection</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Visual calendar grid, screen allocation specs, ticket pricing tiers, and real-time conflict prevention.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Show Time</span>
        </button>
      </div>

      {/* Conflict Engine Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950 to-gray-900 border border-brand-800/80 text-white flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white block">Automated Conflict Lock Active</span>
            <span className="text-gray-400 text-[11px]">System prevents double-booking screens across overlapping show windows.</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
          0 Overlaps Locked
        </span>
      </div>

      {/* Schedule Table / Grid */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 font-semibold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Movie</th>
              <th className="p-4">Theater & Screen</th>
              <th className="p-4">Show Date</th>
              <th className="p-4">Show Timing</th>
              <th className="p-4">Ticket Price</th>
              <th className="p-4">Conflict Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {shows.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40">
                <td className="p-4">
                  <div className="font-extrabold text-gray-900 dark:text-white">{s.movie?.title}</div>
                  <div className="text-[10px] text-gray-400">{s.movie?.genre} ({s.movie?.language})</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{s.screen?.theater?.name}</div>
                  <div className="text-[10px] text-brand-500 font-bold">{s.screen?.name} ({s.screen?.screenFormat})</div>
                </td>
                <td className="p-4 font-mono">{formatDate(s.showDate)}</td>
                <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">
                  {s.startTime} - {s.endTime}
                </td>
                <td className="p-4 font-extrabold text-emerald-500">
                  ₹{s.ticketPriceStandard} Std / ₹{s.ticketPriceVip} VIP
                </td>
                <td className="p-4">
                  {s.conflictLocked ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Conflicted Lock</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Scheduled</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Schedule Show & Lock Screen
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleShow} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Movie</label>
                <select
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Screen Venue</label>
                <select
                  value={screenId}
                  onChange={(e) => setScreenId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  {allScreens.map((s) => (
                    <option key={s.id} value={s.id}>{s.theaterName} - {s.name} ({s.screenFormat})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Date</label>
                  <input
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="14:30"
                    className="w-full px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="17:30"
                    className="w-full px-2 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Standard Ticket Price (₹)</label>
                <input
                  type="number"
                  value={ticketPriceStandard}
                  onChange={(e) => setTicketPriceStandard(e.target.value)}
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
                  {creating ? "Checking Conflicts..." : "Lock & Schedule Show"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
