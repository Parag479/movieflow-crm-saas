"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, Mail, ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubmitted(true);
      setMsg(data.message || "Reset link sent!");
    } catch (err) {
      setSubmitted(true);
      setMsg("If an account is associated with this email, instructions have been sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      <div className="w-full max-w-md space-y-6 bg-gray-900/80 border border-gray-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reset Password</h2>
            <p className="text-xs text-gray-400">MovieFlow Enterprise Workspace Security</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Password Reset Requested</span>
            </div>
            <p>{msg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition"
            >
              {loading ? "Processing..." : "Send Password Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
