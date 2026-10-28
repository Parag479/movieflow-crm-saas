"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, Lock, Mail, Building, ArrowRight, CheckCircle, Sparkles, Eye, EyeOff, Users, Globe, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@movieflow.com");
  const [password, setPassword] = useState("admin123");
  const [companyCode, setCompanyCode] = useState("METRO_CINEMA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, companyCode }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("movieflow_token", data.data.token);
        localStorage.setItem("movieflow_user", JSON.stringify(data.data.user));
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to authentication service");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (demoEmail: string, demoCode: string) => {
    setEmail(demoEmail);
    setCompanyCode(demoCode);
    setPassword("admin123");
  };

  const featureStats = [
    { icon: Users, label: "Active Tenants", value: "120+" },
    { icon: Globe, label: "States Covered", value: "28" },
    { icon: Zap, label: "Screens Managed", value: "14K+" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-950 text-white font-sans">
      {/* ── Left Branding Hero Panel ── */}
      <div className="lg:w-[55%] relative overflow-hidden flex flex-col justify-between p-8 lg:p-16 bg-gradient-to-br from-[#060b16] via-[#091223] to-[#0c1a33] border-b lg:border-b-0 lg:border-r border-gray-800/60">
        {/* Ambient glow orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cinema-accent/10 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-900/20 blur-[120px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-500 to-cinema-accent flex items-center justify-center shadow-xl shadow-brand-500/25 ring-1 ring-white/10">
            <Film className="w-6 h-6 text-white drop-shadow" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-brand-400 bg-clip-text text-transparent">
              MovieFlow CRM
            </h1>
            <p className="text-[11px] font-bold text-brand-400/80 tracking-[0.2em] uppercase">
              Enterprise Distribution Suite
            </p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-10 space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse-slow" />
            <span>Multi-Tenant · AI-Powered · Real-Time Analytics</span>
          </div>

          <h2 className="text-3xl lg:text-[2.6rem] font-extrabold tracking-tight leading-[1.15]">
            The Command Center for
            <span className="block mt-1 bg-gradient-to-r from-brand-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Indian Cinema Distribution
            </span>
          </h2>

          <p className="text-gray-400 text-sm lg:text-[15px] leading-relaxed max-w-md">
            Agreement automation, screen conflict detection, dynamic revenue-share settlements, GST invoicing, CRM pipeline, and AI demand forecasting — all in one enterprise platform.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {[
              { icon: CheckCircle, color: "text-emerald-400", text: "ISO 27001 Row-Level Tenant Security Isolation" },
              { icon: CheckCircle, color: "text-amber-400", text: "Automated GST / TDS Invoice Generation (India Compliant)" },
              { icon: CheckCircle, color: "text-brand-400", text: "Distributor 360° Ledger, Collections & Payment Tracking" },
              { icon: CheckCircle, color: "text-purple-400", text: "AI Box Office Demand Forecasting Engine" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <f.icon className={`w-4 h-4 ${f.color} shrink-0`} />
                <span className="text-xs font-medium text-gray-300">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {featureStats.map((s, i) => (
              <div key={i} className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <s.icon className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-white">{s.value}</div>
                <div className="text-[10px] text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-800/60 pt-5">
          <span>&copy; 2026 MovieFlow SaaS Technologies Pvt. Ltd.</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">v1.0 • Production</span>
        </div>
      </div>

      {/* ── Right Login Form Panel ── */}
      <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-14 bg-gray-950">
        <div className="w-full max-w-[400px] space-y-7">
          {/* Form Header */}
          <div className="space-y-1.5">
            <h3 className="text-[1.6rem] font-extrabold tracking-tight text-white">
              Welcome back
            </h3>
            <p className="text-sm text-gray-400">
              Sign in to your enterprise workspace.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium animate-fade-in">
              <span className="mt-px shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Company Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Tenant Company Code
              </label>
              <div className="relative group">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="company-code-input"
                  type="text"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  placeholder="e.g. METRO_CINEMA"
                  required
                  autoComplete="organization"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-800 bg-gray-900/80 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 uppercase tracking-wide transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Work Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-800 bg-gray-900/80 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 text-sm rounded-xl border border-gray-800 bg-gray-900/80 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group mt-2"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Tenant Quick Access */}
          <div className="pt-2 border-t border-gray-800/70 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span className="uppercase tracking-widest">1-Click Demo Profiles</span>
              <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20 font-mono">
                PWD: admin123
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-admin-btn"
                type="button"
                onClick={() => fillDemoCreds("admin@movieflow.com", "METRO_CINEMA")}
                className="group p-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800/90 border border-gray-800 hover:border-brand-500/40 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-brand-400 transition-colors">CEO / Super Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">Rajesh Singhania</div>
                <div className="text-[9px] text-gray-500">METRO_CINEMA</div>
              </button>

              <button
                id="demo-distributor-btn"
                type="button"
                onClick={() => fillDemoCreds("distributor@aafilms.in", "METRO_CINEMA")}
                className="group p-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800/90 border border-gray-800 hover:border-purple-500/40 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-purple-400 transition-colors">Distributor Partner</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">Anil Thadani (AA Films)</div>
                <div className="text-[9px] text-gray-500">Pan-India Circuit</div>
              </button>

              <button
                id="demo-finance-btn"
                type="button"
                onClick={() => fillDemoCreds("finance@metrocinemas.com", "METRO_CINEMA")}
                className="group p-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800/90 border border-gray-800 hover:border-amber-500/40 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">Finance Head</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">Neha Sharma</div>
                <div className="text-[9px] text-gray-500">Invoicing & Settlements</div>
              </button>

              <button
                id="demo-statemanager-btn"
                type="button"
                onClick={() => fillDemoCreds("statemanager.mh@metrocinemas.com", "METRO_CINEMA")}
                className="group p-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800/90 border border-gray-800 hover:border-blue-500/40 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">State Manager</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">Sanjay Deshmukh</div>
                <div className="text-[9px] text-gray-500">Maharashtra Circuit</div>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center text-gray-600">
            New company workspace?{" "}
            <Link href="/signup" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Register Enterprise Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
