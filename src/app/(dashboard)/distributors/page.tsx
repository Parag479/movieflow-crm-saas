"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Building2,
  Tv2,
  TrendingUp,
  Receipt,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  MapPin,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("movieflow_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (Array.isArray(u.roles)) setUserRoles(u.roles);
      }
    } catch {}
  }, []);

  const isDistributor = userRoles.includes("DISTRIBUTOR");

  // New distributor state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("MAIN");
  const [territory, setTerritory] = useState("Pan India");
  const [statesInput, setStatesInput] = useState("Maharashtra, Goa");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchDistributors = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (selectedState) query.set("state", selectedState);

    fetch(`/api/distributors?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDistributors(data.data);
          setSummary(data.summary);
        }
      })
      .catch((err) => console.error("Error fetching distributors:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDistributors();
  }, [selectedState]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDistributors();
  };

  const handleAddDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const statesArray = statesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/distributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          type,
          territory,
          states: statesArray,
          gstNumber,
          panNumber,
          bankName,
          accountNumber,
          ifscCode,
          contactPerson,
          email,
          phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName("");
        setCode("");
        fetchDistributors();
      } else {
        alert(data.message || "Failed to create distributor");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-brand-950/70 border border-gray-800 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>{isDistributor ? "My Distributor 360° Account & Ledger" : "Distributor 360° Business Performance & Payment Tracking"}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            {isDistributor ? "My Distribution Performance Hub" : "Pan-India Distributor Command Center"}
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm max-w-2xl">
            {isDistributor
              ? "Live screen collections, distributor share splits, ledger transactions, and verified settlements for your account."
              : "Live business performance, box office collections, distributor share splits, financial ledgers, and overdue payment tracking across all distribution circuits."}
          </p>
        </div>

        {!isDistributor && (
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Distributor Firm</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-brand-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Gross Collection</span>
            <div className="text-lg font-extrabold text-white">{formatCurrency(summary.totalGross)}</div>
            <div className="text-[10px] text-brand-400">Box office telemetry</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Net Collection</span>
            <div className="text-lg font-extrabold text-white">{formatCurrency(summary.totalNet)}</div>
            <div className="text-[10px] text-blue-400">Post GST & deductions</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Distributor Share</span>
            <div className="text-lg font-extrabold text-emerald-400">{formatCurrency(summary.totalDistributorShare)}</div>
            <div className="text-[10px] text-emerald-500 font-medium">Contractual share</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-teal-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Received</span>
            <div className="text-lg font-extrabold text-teal-400">{formatCurrency(summary.totalReceived)}</div>
            <div className="text-[10px] text-teal-500 font-medium">Cleared ledger credits</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Outstanding Balance</span>
            <div className="text-lg font-extrabold text-amber-400">{formatCurrency(summary.totalOutstanding)}</div>
            <div className="text-[10px] text-amber-500">Unsettled receivables</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-red-500 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Overdue Dues</span>
            <div className="text-lg font-extrabold text-red-400">{formatCurrency(summary.totalOverdue)}</div>
            <div className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Action required
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search distributor name, code, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-800 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <span>Filter State:</span>
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-xs text-white focus:outline-none"
          >
            <option value="">All States / Pan-India</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Kerala">Kerala</option>
          </select>
        </div>
      </div>

      {/* Distributors Master Performance Table */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs">Loading distributor business profiles & live ledgers...</div>
      ) : distributors.length === 0 ? (
        <div className="p-16 text-center text-gray-400 glass-panel rounded-3xl border border-gray-800 space-y-2">
          <Truck className="w-10 h-10 mx-auto text-gray-600" />
          <h3 className="font-bold text-white text-sm">No distributors found</h3>
          <p className="text-xs text-gray-500">Try modifying your search or state filter.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Distributor Company</th>
                  <th className="p-4">Assigned Territory & States</th>
                  <th className="p-4">Catalog & Screens</th>
                  <th className="p-4">Gross Collection</th>
                  <th className="p-4">Distributor Share</th>
                  <th className="p-4">Total Received</th>
                  <th className="p-4">Outstanding Balance</th>
                  <th className="p-4">Payment Health</th>
                  <th className="p-4 text-right">360° Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {distributors.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-800/30 transition group cursor-pointer"
                    onClick={() => (window.location.href = `/distributors/${d.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-extrabold text-white group-hover:text-brand-400 transition flex items-center gap-2">
                        <span>{d.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 font-mono font-bold border border-brand-500/20">
                          {d.code}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {d.contactPerson} • {d.phone || d.email}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{d.territory}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {d.states?.slice(0, 3).map((st: string) => (
                          <span
                            key={st}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-gray-800 text-gray-300 border border-gray-700"
                          >
                            {st}
                          </span>
                        ))}
                        {d.states?.length > 3 && (
                          <span className="text-[9px] text-gray-500 font-semibold">+{d.states.length - 3} more</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Tv2 className="w-3.5 h-3.5 text-brand-400" />
                        <span>{d.activeScreens} Screens</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {d.totalMovies} Movies • {d.activeTheatres} Theatres
                      </div>
                    </td>

                    <td className="p-4 font-bold text-white">
                      {formatCurrency(d.totalGross)}
                    </td>

                    <td className="p-4 font-extrabold text-emerald-400">
                      {formatCurrency(d.distributorShare)}
                    </td>

                    <td className="p-4 font-bold text-teal-400">
                      {formatCurrency(d.totalReceived)}
                    </td>

                    <td className="p-4 font-extrabold text-amber-400">
                      {formatCurrency(d.outstandingBalance)}
                    </td>

                    <td className="p-4">
                      {d.overdueAmount > 0 ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            <AlertCircle className="w-3 h-3" /> Overdue: {formatCurrency(d.overdueAmount)}
                          </span>
                        </div>
                      ) : d.outstandingBalance > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Payment Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Fully Settled
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/distributors/${d.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white font-bold transition text-[11px]"
                      >
                        <span>View 360°</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Distributor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Add Distributor Firm</h3>
                <p className="text-[11px] text-gray-400">Initialize company credentials, territory rights, and automated ledger</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDistributor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Company Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yash Raj Films Distribution"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Distributor Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. YRF_IND"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white uppercase focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    <option value="MAIN">Main National Distributor</option>
                    <option value="SUB">Sub-Distributor Circuit</option>
                    <option value="OVERSEAS">Overseas International</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Primary Territory</label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    placeholder="e.g. Mumbai Circuit / Pan India"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Assigned States (comma separated)</label>
                <input
                  type="text"
                  value={statesInput}
                  onChange={(e) => setStatesInput(e.target.value)}
                  placeholder="Maharashtra, Goa, Gujarat, Delhi"
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">GST Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="27AAACW9988G1ZK"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">PAN Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="AAACW9988G"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-800">
                <label className="font-bold text-gray-200">Bank Settlement Account</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank Name (e.g. HDFC)"
                    className="px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account Number"
                    className="px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="IFSC Code"
                    className="px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Anil Kapoor"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finance@yrf.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 11223"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md"
                >
                  {creating ? "Creating..." : "Save & Initialize Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
