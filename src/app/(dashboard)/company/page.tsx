"use client";

import React, { useState, useEffect } from "react";
import { Building2, Save, Upload, ShieldCheck, CheckCircle2, Globe, Mail, Phone, MapPin } from "lucide-react";

export default function CompanyPage() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/company")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCompany(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");

    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMsg("Company branding & profile saved successfully!");
        setTimeout(() => setSavedMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading company profile...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-500" />
            <span>Company Profile & Branding</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your organization details, branding theme, and multi-tenant billing parameters.
          </p>
        </div>
        {savedMsg && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMsg}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Organization Details */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            Organization Master Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Company Name</label>
              <input
                type="text"
                value={company?.name || ""}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tenant Code (Read Only)</label>
              <input
                type="text"
                value={company?.code || ""}
                disabled
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Corporate Email</label>
              <input
                type="email"
                value={company?.email || ""}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Official Contact Phone</label>
              <input
                type="text"
                value={company?.phone || ""}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Headquarters Address</label>
            <input
              type="text"
              value={company?.address || ""}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* GST & Tax Compliance */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            Tax & Legal Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">GST Registration Number</label>
              <input
                type="text"
                value={company?.gstNumber || ""}
                onChange={(e) => setCompany({ ...company, gstNumber: e.target.value.toUpperCase() })}
                placeholder="27AAACM1234F1Z9"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Brand Color Hex Code</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={company?.brandColor || "#0c8de9"}
                  onChange={(e) => setCompany({ ...company, brandColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 dark:border-gray-700 p-1"
                />
                <input
                  type="text"
                  value={company?.brandColor || "#0c8de9"}
                  onChange={(e) => setCompany({ ...company, brandColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
