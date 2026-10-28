"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building, Mail, Lock, User, Phone, ArrowRight, Film, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyCode,
          fullName,
          email,
          password,
          phone,
        }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("movieflow_token", data.data.token);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Failed to register company");
      }
    } catch (err) {
      setError("Network error connecting to registration service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      <div className="w-full max-w-xl space-y-8 bg-gray-900/80 border border-gray-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">MovieFlow Enterprise</h2>
            <p className="text-xs text-gray-400">Register New Company Workspace</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. Apex Distribution Films"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Company Code (Unique Tenant ID)</label>
              <input
                type="text"
                placeholder="e.g. APEX_FILMS"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white uppercase focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Admin Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Work Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="admin@apexfilms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition"
          >
            {loading ? "Initializing Workspace..." : "Create Tenant Account & Launch"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
