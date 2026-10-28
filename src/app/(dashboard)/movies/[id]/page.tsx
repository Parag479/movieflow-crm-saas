"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Film, ChevronLeft, Calendar, Globe, DollarSign, TrendingUp, Layers, Tv2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/movies?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) {
          const found = data.data.find((m: any) => m.id === params.id) || data.data[0];
          setMovie(found);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading movie details...</div>;
  if (!movie) return <div className="p-12 text-center text-red-500">Movie record not found.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <Link href="/movies" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:underline">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Movies Catalog</span>
      </Link>

      <div className="glass-panel p-6 rounded-3xl space-y-6 border border-gray-800 bg-gray-900/80">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 h-80 rounded-2xl overflow-hidden bg-gray-950 shrink-0">
            <img
              src={movie.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80"}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">{movie.genre}</span>
                <h1 className="text-3xl font-extrabold text-white">{movie.title}</h1>
                <p className="text-xs text-gray-400 mt-1">
                  Language: {movie.language} • {movie.durationMinutes} Mins • Rating: {movie.rating || "U/A"}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                {movie.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Production Budget</span>
                <div className="font-bold text-white text-sm mt-0.5">{formatCurrency(movie.budgetAmount || 0)}</div>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">P&A Distribution Cost</span>
                <div className="font-bold text-red-400 text-sm mt-0.5">{formatCurrency(movie.totalDistCost || 0)}</div>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Weekly Gross</span>
                <div className="font-bold text-blue-400 text-sm mt-0.5">{formatCurrency(movie.weeklyGross || 0)}</div>
              </div>
              <div className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Lifetime Gross</span>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">{formatCurrency(movie.lifetimeGross || 0)}</div>
              </div>
            </div>

            <div className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-gray-800">
              <div><strong className="text-white">Director:</strong> {movie.director || "Amar Kaushik"}</div>
              <div><strong className="text-white">Producer / House:</strong> {movie.producer || "Maddock Films"}</div>
              <div><strong className="text-white">Main Distributor:</strong> {movie.distributorName || "AA Films"}</div>
              <div><strong className="text-white">Territory Rights:</strong> {movie.territoryRights || "Pan India"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
