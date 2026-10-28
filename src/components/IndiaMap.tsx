"use client";

import React, { useState } from "react";
import { Building2, Tv2, DollarSign, TrendingUp, Users, X, ChevronRight, MapPin, Sparkles, CreditCard, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface StateOrCityData {
  state?: string;
  city?: string;
  code?: string;
  activeDistributorsCount?: number;
  theatersCount: number;
  screensCount: number;
  showsCount?: number;
  audienceAttendance?: number;
  capacity?: number;
  distributionCost?: number;
  grossCollection: number;
  netCollection?: number;
  distributorShare: number;
  exhibitorShare?: number;
  paymentsReceived?: number;
  pendingAmount?: number;
  overdueAmount?: number;
  expenses?: number;
  netProfit: number;
  avgOccupancy: number;
  theaters?: Array<{
    id: string;
    name: string;
    city?: string;
    circuit: string;
    screens: number;
    capacity: number;
  }>;
  cities?: Array<{
    city: string;
    gross: number;
    distShare: number;
    attendance: number;
    theatersCount: number;
    screensCount: number;
  }>;
}

interface IndiaMapProps {
  items: StateOrCityData[];
  selectedItem?: StateOrCityData | null;
  onSelectItem?: (item: StateOrCityData) => void;
  title?: string;
  subtitle?: string;
}

// Preset map marker positions mapped onto standard SVG viewbox (0 0 500 550)
const geoCoordinates: Record<string, { x: number; y: number }> = {
  // States
  Maharashtra: { x: 195, y: 350 },
  Delhi: { x: 220, y: 190 },
  Karnataka: { x: 210, y: 440 },
  "Tamil Nadu": { x: 235, y: 465 },
  Telangana: { x: 230, y: 370 },
  Gujarat: { x: 160, y: 280 },
  "Uttar Pradesh": { x: 275, y: 230 },
  "West Bengal": { x: 335, y: 290 },
  Rajasthan: { x: 175, y: 235 },
  Kerala: { x: 205, y: 490 },
  Haryana: { x: 210, y: 195 },

  // Cities fallback
  Mumbai: { x: 180, y: 350 },
  Thane: { x: 185, y: 342 },
  Pune: { x: 195, y: 365 },
  Nagpur: { x: 260, y: 320 },
  Gurgaon: { x: 215, y: 195 },
  Lucknow: { x: 280, y: 220 },
  Jaipur: { x: 180, y: 220 },
  Chennai: { x: 240, y: 460 },
  Bengaluru: { x: 210, y: 440 },
  Hyderabad: { x: 230, y: 370 },
  Kolkata: { x: 340, y: 290 },
  Ahmedabad: { x: 155, y: 275 },
  Kochi: { x: 200, y: 485 },
};

export default function IndiaMap({
  items,
  selectedItem: externalSelected,
  onSelectItem,
  title = "Pan-India Theatrical Distribution Telemetry Map",
  subtitle = "Click any state or circuit marker to inspect live distributors, screens, collections, and pending settlements.",
}: IndiaMapProps) {
  const [internalSelected, setInternalSelected] = useState<StateOrCityData | null>(items[0] || null);
  const activeItem = externalSelected !== undefined ? externalSelected : internalSelected;

  const handleClick = (item: StateOrCityData) => {
    if (onSelectItem) {
      onSelectItem(item);
    } else {
      setInternalSelected(item);
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 w-full">
      {/* Map Graphic Canvas */}
      <div className="flex-1 glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950/40 border border-gray-800 min-h-[520px]">
        {/* Ambient glow effects */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-cinema-accent/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-400" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> High Gross (≥₹10Cr)
            </span>
            <span className="flex items-center gap-1.5 text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50" /> Active Circuit
            </span>
          </div>
        </div>

        {/* SVG Map of India Outline + State Markers */}
        <div className="relative w-full h-[450px] flex items-center justify-center">
          <svg viewBox="0 0 500 550" className="w-full h-full max-h-[450px] drop-shadow-2xl">
            {/* India Stylized Geographical Path Outline */}
            <path
              d="M 220 70 L 250 85 L 280 120 L 320 150 L 360 210 L 370 250 L 340 270 L 360 300 L 330 330 L 300 360 L 260 420 L 240 480 L 220 510 L 195 490 L 190 440 L 160 380 L 150 330 L 120 280 L 140 240 L 160 210 L 190 150 Z"
              fill="rgba(15, 23, 42, 0.7)"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="transition-all duration-500 hover:stroke-brand-400"
            />

            {/* Connecting Circuit Grid Lines */}
            <line x1="195" y1="350" x2="220" y2="190" stroke="rgba(12, 141, 233, 0.18)" strokeWidth="1" />
            <line x1="195" y1="350" x2="210" y2="440" stroke="rgba(12, 141, 233, 0.18)" strokeWidth="1" />
            <line x1="195" y1="350" x2="335" y2="290" stroke="rgba(12, 141, 233, 0.18)" strokeWidth="1" />
            <line x1="220" y1="190" x2="335" y2="290" stroke="rgba(12, 141, 233, 0.18)" strokeWidth="1" />
            <line x1="210" y1="440" x2="235" y2="465" stroke="rgba(12, 141, 233, 0.18)" strokeWidth="1" />

            {/* State/City Pulse Nodes */}
            {items.map((item) => {
              const name = item.state || item.city || "";
              const coords = geoCoordinates[name] || { x: 250, y: 270 };
              const isSelected = (activeItem?.state || activeItem?.city) === name;
              const isHighYield = item.grossCollection >= 100000000;

              return (
                <g
                  key={name}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  onClick={() => handleClick(item)}
                  className="cursor-pointer group"
                >
                  {/* Pulse Ring */}
                  <circle
                    r={isSelected ? "18" : "12"}
                    className={`${
                      isHighYield ? "fill-emerald-500/25" : "fill-brand-500/25"
                    } animate-ping opacity-75`}
                  />

                  {/* Marker Circle */}
                  <circle
                    r={isSelected ? "11" : "7"}
                    className={`${
                      isSelected
                        ? "fill-white stroke-brand-500 stroke-[3]"
                        : isHighYield
                        ? "fill-emerald-500 group-hover:fill-emerald-400"
                        : "fill-brand-500 group-hover:fill-brand-400"
                    } transition-all duration-300 shadow-lg`}
                  />

                  {/* Label */}
                  <text
                    x="14"
                    y="4"
                    fill={isSelected ? "#38bdf8" : "#f1f5f9"}
                    fontSize={isSelected ? "13" : "11"}
                    fontWeight={isSelected ? "bold" : "600"}
                    className="select-none transition-all group-hover:fill-white font-sans drop-shadow-md"
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Entity Slide-in Panel */}
      <div className="w-full lg:w-96 glass-panel p-6 rounded-3xl space-y-5 border border-gray-800 bg-gray-900/90 flex flex-col justify-between">
        {activeItem ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  Territory / State Telemetry
                </span>
                <h4 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>{activeItem.state || activeItem.city}</span>
                  {activeItem.code && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                      {activeItem.code}
                    </span>
                  )}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase">Occupancy</span>
                <span className="text-lg font-extrabold text-emerald-400">{activeItem.avgOccupancy}%</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-800 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Active Distributors</span>
                <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-400" />
                  <span>{activeItem.activeDistributorsCount || 2} Firms</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-800 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Active Screens</span>
                <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <Tv2 className="w-4 h-4 text-emerald-400" />
                  <span>{activeItem.screensCount} Screens</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-800 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Gross Collection</span>
                <div className="text-sm font-bold text-white">
                  {formatCurrency(activeItem.grossCollection)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-800 space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Distributor Share</span>
                <div className="text-sm font-bold text-emerald-400">
                  {formatCurrency(activeItem.distributorShare)}
                </div>
              </div>
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-950 to-gray-900 border border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-300">Settlements & Net Position</span>
                <span className="text-teal-400 font-extrabold">Profit: {formatCurrency(activeItem.netProfit)}</span>
              </div>
              <div className="space-y-1.5 text-gray-400">
                <div className="flex justify-between">
                  <span>Payments Received:</span>
                  <span className="font-semibold text-teal-400">{formatCurrency(activeItem.paymentsReceived || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Amount:</span>
                  <span className="font-semibold text-amber-400">{formatCurrency(activeItem.pendingAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Dues:</span>
                  <span className="font-semibold text-red-400">{formatCurrency(activeItem.overdueAmount || 0)}</span>
                </div>
              </div>
            </div>

            {/* Cities / Theatres Detail List */}
            {activeItem.cities && activeItem.cities.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Major Cities in {activeItem.state}
                </h5>
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {activeItem.cities.map((c) => (
                    <div key={c.city} className="p-2 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{c.city}</span>
                        <div className="text-[10px] text-gray-400">{c.theatersCount} Theatres • {c.screensCount} Screens</div>
                      </div>
                      <span className="font-bold text-emerald-400">{formatCurrency(c.gross)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">Select any state marker on the map to inspect telemetry.</div>
        )}
      </div>
    </div>
  );
}
