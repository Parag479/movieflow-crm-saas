"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clapperboard, Plus, Search, Filter, Calendar, Globe, Film, DollarSign, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newMovie, setNewMovie] = useState({
    title: "",
    language: "Hindi",
    genre: "Action",
    durationMinutes: 140,
    rating: "U/A",
    director: "",
    producer: "",
    distributorName: "AA Films",
    territoryRights: "Pan India",
    releaseDate: "2026-08-15",
    budgetAmount: 1000000000,
    printsCost: 150000000,
    pubCost: 200000000,
    status: "UPCOMING",
  });

  const fetchMovies = () => {
    setLoading(true);
    fetch(`/api/movies?search=${search}&status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMovies(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovies();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchMovies();
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
            <Clapperboard className="w-6 h-6 text-brand-500" />
            <span>Movie Catalog & Release Management</span>
          </h1>
          <p className="text-xs text-gray-400">
            Create movies, manage release timelines, formats, posters, budget, P&A distribution costs, and territory rights.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search title, genre, language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMovies()}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-800 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-800 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_THEATERS">In Theaters Now</option>
            <option value="UPCOMING">Upcoming Releases</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((m) => (
            <div key={m.id} className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-gray-800 bg-gray-900/60">
              <div className="relative h-48 w-full overflow-hidden bg-gray-950">
                <img
                  src={m.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"}
                  alt={m.title}
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-300"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white border border-white/20 backdrop-blur-md">
                  {m.status}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                  {m.language}
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{m.title}</h3>
                  <div className="text-xs text-gray-400 mt-1">{m.genre} • {m.durationMinutes} mins • {m.rating}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-gray-800 py-3">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Gross Revenue</span>
                    <div className="font-bold text-emerald-400">{formatCurrency(m.lifetimeGross || m.weeklyGross || 0)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Dist. Cost</span>
                    <div className="font-bold text-amber-400">{formatCurrency(m.totalDistCost || 0)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Active Screens</span>
                    <div className="font-bold text-white">{m.totalScreens || 0} Screens</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Territory Rights</span>
                    <div className="font-bold text-brand-400">{m.territoryRights || "Pan India"}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(m.releaseDate).toLocaleDateString()}</span>
                  </span>
                  <Link href={`/distribution?movieId=${m.id}`} className="text-brand-400 font-semibold hover:underline flex items-center gap-1">
                    <span>Manage Distribution</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl space-y-4 border border-gray-800 bg-gray-900 text-white">
            <h2 className="text-lg font-bold">Add New Movie to Catalog</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400">Movie Title</label>
                <input
                  type="text"
                  required
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400">Language</label>
                  <input
                    type="text"
                    value={newMovie.language}
                    onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">Genre</label>
                  <input
                    type="text"
                    value={newMovie.genre}
                    onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400">Production Budget (INR)</label>
                  <input
                    type="number"
                    value={newMovie.budgetAmount}
                    onChange={(e) => setNewMovie({ ...newMovie, budgetAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400">Prints & Publicity (P&A Cost)</label>
                  <input
                    type="number"
                    value={newMovie.printsCost}
                    onChange={(e) => setNewMovie({ ...newMovie, printsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500">
                  {submitting ? "Saving..." : "Save Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
