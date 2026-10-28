"use client";

import React, { useState, useEffect } from "react";
import { Tv2, Plus, Building2, MapPin, Phone, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function TheatersPage() {
  const [theaters, setTheaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/theaters")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTheaters(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Tv2 className="w-6 h-6 text-brand-500" />
            <span>Theatre & Multi-Screen Management</span>
          </h1>
          <p className="text-xs text-gray-400">
            Database of all cinema venues, multiplexes, single-screen theatres, screen formats (IMAX, 4DX, 2D, 3D), seating capacities, facilities, and contact agreements.
          </p>
        </div>
      </div>

      {/* Theaters Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading theatre registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theaters.map((t) => (
            <div key={t.id} className="glass-panel p-6 rounded-3xl space-y-4 border border-gray-800 bg-gray-900/70 hover:border-brand-500/40 transition">
              <div className="flex items-start justify-between border-b border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                    {t.circuit || "Multiplex Circuit"}
                  </span>
                  <h3 className="text-lg font-bold text-white">{t.name}</h3>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{t.city}, {t.state}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {t.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-b border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Screens</span>
                  <div className="font-extrabold text-white text-base">{t.totalScreens} Screens</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Seating Capacity</span>
                  <div className="font-extrabold text-emerald-400 text-base">{t.totalCapacity} Seats</div>
                </div>
              </div>

              {/* Owner Contact */}
              <div className="space-y-1 text-xs text-gray-300">
                <div className="font-semibold text-white">Owner: {t.ownerName || "Venue Manager"}</div>
                <div className="text-gray-400 text-[11px] flex items-center gap-2">
                  <Phone className="w-3 h-3" /> {t.ownerPhone || "+91 98000 00000"}
                </div>
                <div className="text-gray-400 text-[11px] flex items-center gap-2">
                  <Mail className="w-3 h-3" /> {t.ownerEmail || "contact@theater.com"}
                </div>
              </div>

              {/* Screens List */}
              {t.screens && t.screens.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Screen Specifications</span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.screens.map((sc: any) => (
                      <span key={sc.id} className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-300 text-[10px] font-semibold border border-gray-700">
                        {sc.name} ({sc.screenFormat})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
