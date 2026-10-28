"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Tv2, ChevronLeft, MapPin, Phone, Mail, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function TheaterDetailPage({ params }: { params: { id: string } }) {
  const [theater, setTheater] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/theaters?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) {
          const found = data.data.find((t: any) => t.id === params.id) || data.data[0];
          setTheater(found);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading theatre details...</div>;
  if (!theater) return <div className="p-12 text-center text-red-500">Theater record not found.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <Link href="/theaters" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:underline">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Theatres</span>
      </Link>

      <div className="glass-panel p-6 rounded-3xl space-y-6 border border-gray-800 bg-gray-900/80">
        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">{theater.circuit || "Multiplex Circuit"}</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{theater.name}</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span>{theater.address}, {theater.city}, {theater.state}</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {theater.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Screens</span>
            <div className="font-extrabold text-white text-lg mt-1">{theater.totalScreens} Screens</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Seating Capacity</span>
            <div className="font-extrabold text-emerald-400 text-lg mt-1">{theater.totalCapacity} Seats</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Circuit Chain</span>
            <div className="font-bold text-brand-400 text-base mt-1">{theater.circuit || "PVR INOX"}</div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-300 border-t border-gray-800 pt-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Operator</h3>
          <div><strong className="text-white">Owner / Manager:</strong> {theater.ownerName || "Venue Manager"}</div>
          <div><strong className="text-white">Phone:</strong> {theater.ownerPhone || "+91 98000 00000"}</div>
          <div><strong className="text-white">Email:</strong> {theater.ownerEmail || "contact@theater.com"}</div>
        </div>
      </div>
    </div>
  );
}
