"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, ChevronLeft, MapPin, Building2, Tv2, DollarSign, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DistributionDetailPage({ params }: { params: { id: string } }) {
  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/distributions/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDistribution(data.data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading distribution detail...</div>;
  if (!distribution) return <div className="p-12 text-center text-red-500">Distribution record not found.</div>;

  const netProfit = distribution.distributorShare - distribution.distributionCost;

  return (
    <div className="space-y-8 animate-fade-in">
      <Link href="/distribution" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:underline">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Distribution Hub</span>
      </Link>

      <div className="glass-panel p-6 rounded-3xl space-y-6 border border-gray-800 bg-gray-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {distribution.territory?.name} Circuit
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{distribution.movie?.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Released: {new Date(distribution.releaseDate).toLocaleDateString()} • Distributor: {distribution.distributor?.name || "AA Films"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Status: {distribution.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Screens</span>
            <div className="font-extrabold text-white text-lg mt-1">{distribution.totalScreens}</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Theatres</span>
            <div className="font-extrabold text-white text-lg mt-1">{distribution.totalTheatres}</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Gross Collection</span>
            <div className="font-extrabold text-blue-400 text-lg mt-1">{formatCurrency(distribution.grossCollection)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Net Profit</span>
            <div className={`font-extrabold text-lg mt-1 ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(netProfit)}
            </div>
          </div>
        </div>

        {/* City Releases Table */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">City Releases & Venue Allocations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Theatre Venue</th>
                  <th className="px-4 py-3">City / State</th>
                  <th className="px-4 py-3">Allocated Screens</th>
                  <th className="px-4 py-3">Shows / Day</th>
                  <th className="px-4 py-3">Ticket Price</th>
                  <th className="px-4 py-3">Gross Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {distribution.cityReleases?.map((cr: any) => (
                  <tr key={cr.id} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-bold text-white">{cr.theater?.name}</td>
                    <td className="px-4 py-3 text-brand-400">{cr.city}, {cr.state}</td>
                    <td className="px-4 py-3 font-bold text-white">{cr.screensAllocated}</td>
                    <td className="px-4 py-3 text-gray-300">{cr.showsPerDay} Shows</td>
                    <td className="px-4 py-3 text-amber-400">₹{cr.ticketPrice}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{formatCurrency(cr.grossCollection)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
