"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Cpu, Clapperboard, Tv2, CheckCircle2, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function AIInsightsPage() {
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAI = () => {
    setLoading(true);
    fetch("/api/ai/forecast")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAiData(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAI();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-900 via-amber-950/40 to-gray-900 border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>MovieFlow Neural Insight Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            AI Demand Prediction & Revenue Optimization
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm">
            Machine learning models predicting box office yield, optimal show timings, and screen allocation.
          </p>
        </div>

        <button
          onClick={fetchAI}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md transition relative z-10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Re-running Models..." : "Re-Calculate AI Signals"}</span>
        </button>
      </div>

      {/* 1. Executive Summary AI Output */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border-l-4 border-l-amber-500">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-500" />
          <span>AI Executive Bulleted Summary</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {aiData?.executiveSummary?.map((bullet: string, i: number) => (
            <div key={i} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-gray-800 dark:text-gray-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 30-Day Revenue Forecast Area Chart */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Weekend Opening Box Office Forecast (AI Projected)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              95% Confidence Interval based on historical booking telemetry & advance hype
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            High Confidence ML Signal
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiData?.revenueForecast || []}>
              <defs>
                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => `₹${val / 100000}L`} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), "Projected Gross"]}
                contentStyle={{
                  backgroundColor: "#111827",
                  borderColor: "#1F2937",
                  borderRadius: "12px",
                  color: "#FFF",
                }}
              />
              <Area type="monotone" dataKey="gross" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAi)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Movie Demand Predictor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-brand-500" />
            <span>Movie Demand Predictor & Timing Optimization</span>
          </h3>

          <div className="space-y-3">
            {aiData?.demandPredictions?.map((d: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span>{d.movieTitle}</span>
                  <span className="text-brand-500">{d.predictedOccupancy}% Occupancy</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Rec. Screen: <strong>{d.recommendedScreen}</strong></span>
                  <span>Optimal Times: <strong>{d.optimalShowTimes.join(", ")}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AI Theater Recommendation Engine */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tv2 className="w-5 h-5 text-emerald-500" />
            <span>AI Theater Circuit Recommendation</span>
          </h3>

          <div className="space-y-3">
            {aiData?.theaterRecommendations?.map((t: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                  <span>{t.theaterName} ({t.city})</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">{t.matchScore}% Match</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Target Demographics: <strong className="text-gray-300">{t.targetAudience}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
