"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Truck,
  ArrowLeft,
  Building2,
  Tv2,
  Film,
  Coins,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  Download,
  Calendar,
  Layers,
  MapPin,
  FileText,
  DollarSign,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DistributorProfilePage() {
  const params = useParams();
  const distributorId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "movies" | "collections" | "ledger" | "invoices" | "payments" | "reports"
  >("overview");

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Payment Form
  const [payAmount, setPayAmount] = useState("");
  const [payInvoiceId, setPayInvoiceId] = useState("");
  const [payMethod, setPayMethod] = useState("RTGS_NEFT");
  const [payUtr, setPayUtr] = useState("");
  const [payNotes, setPayNotes] = useState("");

  // Invoice Form
  const [invBaseAmount, setInvBaseAmount] = useState("5000000");
  const [invDueDate, setInvDueDate] = useState("");
  const [invNotes, setInvNotes] = useState("Theatrical Revenue Share Settlement Billing");
  const [invIsInterstate, setInvIsInterstate] = useState(false);

  // Adjustment Form
  const [adjType, setAdjType] = useState<"DEBIT" | "CREDIT">("CREDIT");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjDesc, setAdjDesc] = useState("");
  const [adjNotes, setAdjNotes] = useState("");

  const fetchProfile = () => {
    setLoading(true);
    fetch(`/api/distributors/${distributorId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
          if (resData.data.invoices?.length > 0) {
            setPayInvoiceId(resData.data.invoices[0].id);
          }
        }
      })
      .catch((err) => console.error("Error fetching distributor profile:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (distributorId) {
      fetchProfile();
    }
  }, [distributorId]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/distributors/${distributorId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(payAmount),
          invoiceId: payInvoiceId || undefined,
          paymentMethod: payMethod,
          transactionRef: payUtr,
          notes: payNotes,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setShowPaymentModal(false);
        setPayAmount("");
        setPayUtr("");
        setPayNotes("");
        fetchProfile();
      } else {
        alert(resData.message || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/distributors/${distributorId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountBeforeTax: Number(invBaseAmount),
          dueDate: invDueDate || undefined,
          notes: invNotes,
          isInterState: invIsInterstate,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setShowInvoiceModal(false);
        setInvBaseAmount("5000000");
        fetchProfile();
      } else {
        alert(resData.message || "Failed to generate invoice");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/distributors/${distributorId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryType: adjType,
          category: "ADJUSTMENT",
          amount: Number(adjAmount),
          description: adjDesc,
          notes: adjNotes,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setShowAdjustmentModal(false);
        setAdjAmount("");
        setAdjDesc("");
        setAdjNotes("");
        fetchProfile();
      } else {
        alert(resData.message || "Failed to post adjustment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 text-xs">
        Loading complete Distributor 360° profile, live ledgers & collections...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-white space-y-4">
        <h2 className="text-xl font-bold">Distributor Profile Not Found</h2>
        <Link href="/distributors" className="text-brand-400 hover:underline text-xs flex items-center justify-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to Directory
        </Link>
      </div>
    );
  }

  const { profile, financialSummary: fin, assignedMovies, collections, ledger, invoices, payments, monthlyTrends } = data;

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      {/* Back Link */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/distributors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Distributor Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Verified Payment</span>
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-brand-950/50 border border-gray-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 font-mono border border-brand-500/30">
                {profile.code}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-800 text-gray-300">
                {profile.type === "MAIN" ? "National Distributor" : "Circuit Sub-Distributor"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {profile.status}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold">{profile.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-white font-medium">{profile.territory}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">States:</span>
                <span className="text-gray-300 font-medium">{profile.states?.join(", ") || "Pan India"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Contact:</span>
                <span className="text-gray-300 font-medium">{profile.contactPerson} ({profile.phone || profile.email})</span>
              </div>
            </div>
          </div>

          {/* Quick Settlement & Outstanding Summary Badge */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 flex items-center gap-6 self-start lg:self-center">
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Net Ledger Balance</span>
              <div className="text-2xl font-extrabold text-amber-400">{formatCurrency(fin.closingBalance)}</div>
              <span className="text-[10px] text-gray-500">
                {fin.closingBalance > 0 ? "Amount Receivable" : "Account Settled"}
              </span>
            </div>

            {fin.overdueAmount > 0 && (
              <div className="pl-6 border-l border-gray-800">
                <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider block">Overdue Invoices</span>
                <div className="text-xl font-extrabold text-red-400">{formatCurrency(fin.overdueAmount)}</div>
                <span className="text-[10px] text-red-500 font-semibold">Immediate attention</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-xs font-semibold overflow-x-auto print:hidden">
        {[
          { id: "overview", label: "Overview 360°" },
          { id: "movies", label: `Assigned Movies (${assignedMovies.length})` },
          { id: "collections", label: `Box Office Collections (${collections.length})` },
          { id: "ledger", label: `Financial Ledger (${ledger.length})` },
          { id: "invoices", label: `Tax Invoices (${invoices.length})` },
          { id: "payments", label: `Payment History (${payments.length})` },
          { id: "reports", label: "Statement & Audit" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: OVERVIEW 360° ────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 6 Key Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-brand-500 space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Gross Box Office</span>
              <div className="text-lg font-extrabold text-white">{formatCurrency(fin.totalGrossCollection)}</div>
              <div className="text-[10px] text-brand-400">{fin.totalShows} shows total</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500 space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Net Collection</span>
              <div className="text-lg font-extrabold text-white">{formatCurrency(fin.totalNetCollection)}</div>
              <div className="text-[10px] text-blue-400">Post GST & cess</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Distributor Share</span>
              <div className="text-lg font-extrabold text-emerald-400">{formatCurrency(fin.totalDistributorShare)}</div>
              <div className="text-[10px] text-emerald-500">Contractual share</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-teal-500 space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Payments Received</span>
              <div className="text-lg font-extrabold text-teal-400">{formatCurrency(fin.totalReceived)}</div>
              <div className="text-[10px] text-teal-500">{fin.totalPayments} verified receipts</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Outstanding Balance</span>
              <div className="text-lg font-extrabold text-amber-400">{formatCurrency(fin.closingBalance)}</div>
              <div className="text-[10px] text-amber-500">Ledger closing balance</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Audience Attendance</span>
              <div className="text-lg font-extrabold text-purple-400">{fin.totalAdmissions.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-purple-400">Tickets booked</div>
            </div>
          </div>

          {/* Monthly Trends Chart: Collections vs Invoiced vs Payments */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  <span>Collection, Invoicing & Payment Trends (FY 2026-27)</span>
                </h3>
                <p className="text-xs text-gray-400">Comparing gross collections, distributor revenue share, and verified cash payments.</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c8de9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0c8de9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip
                    formatter={(v: any, name: any) => [
                      formatCurrency(Number(v)),
                      name === "gross" ? "Gross Collection" : name === "paymentsReceived" ? "Payments Received" : "Distributor Share",
                    ]}
                    contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "12px", color: "#FFF" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="gross" stroke="#0c8de9" fillOpacity={1} fill="url(#colorGross)" name="gross" />
                  <Area type="monotone" dataKey="distShare" stroke="#f59e0b" fillOpacity={0} name="distShare" />
                  <Area type="monotone" dataKey="paymentsReceived" stroke="#10b981" fillOpacity={1} fill="url(#colorPay)" name="paymentsReceived" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Entity Credentials & Banking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Statutory Credentials & Compliance</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">GSTIN</span>
                  <span className="font-mono font-bold text-white">{profile.gstNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">PAN</span>
                  <span className="font-mono font-bold text-white">{profile.panNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Primary Territory</span>
                  <span className="font-semibold text-gray-200">{profile.territory}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Account Status</span>
                  <span className="font-semibold text-emerald-400">{profile.status}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Bank Settlement Account</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Bank Name</span>
                  <span className="font-bold text-white">{profile.bankName || "HDFC Bank"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Account Number</span>
                  <span className="font-mono font-bold text-white">{profile.accountNumber || "50200889912345"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">IFSC Code</span>
                  <span className="font-mono font-bold text-white">{profile.ifscCode || "HDFC0000123"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Settlement Cycle</span>
                  <span className="font-semibold text-brand-400">Weekly (Every Monday)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ASSIGNED MOVIES & SCREENS ────────────────────────────── */}
      {activeTab === "movies" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedMovies.map((m: any) => (
              <div key={m.id} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-20 rounded-xl bg-gray-800 overflow-hidden shrink-0">
                    {m.posterUrl ? (
                      <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">{m.title}</h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {m.status}
                    </span>
                    <p className="text-[11px] text-gray-400">Release: {formatDate(m.releaseDate)}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Territory Rights:</span>
                    <span className="font-semibold text-white">{m.territory || "Mumbai Circuit"}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Distributor Share %:</span>
                    <span className="font-bold text-emerald-400">{m.distributorSharePct || 50}%</span>
                  </div>
                  {m.mgAmount > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Minimum Guarantee:</span>
                      <span className="font-bold text-amber-400">{formatCurrency(m.mgAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: COLLECTIONS ─────────────────────────────────────────── */}
      {activeTab === "collections" && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-400" />
              <span>Verified Screen-Level Box Office Collection Reports</span>
            </h3>
            <span className="text-xs text-gray-400">{collections.length} reports logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Movie & Screen</th>
                  <th className="p-4">Theatre & City</th>
                  <th className="p-4">Date / Shows</th>
                  <th className="p-4">Occupancy</th>
                  <th className="p-4">Tickets Sold</th>
                  <th className="p-4">Gross Collection</th>
                  <th className="p-4">GST / Deductions</th>
                  <th className="p-4">Net Collection</th>
                  <th className="p-4">Distributor Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {collections.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-800/30">
                    <td className="p-4">
                      <div className="font-extrabold text-white">{c.movieTitle}</div>
                      <div className="text-[10px] text-brand-400">{c.screenName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{c.theaterName}</div>
                      <div className="text-[10px] text-gray-400">{c.city}, {c.state}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{formatDate(c.collectionDate)}</div>
                      <div className="text-[10px] text-gray-400">{c.shows} shows ({c.dayOfWeek})</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.occupancyRate >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-800 text-gray-300"
                      }`}>
                        {c.occupancyRate}%
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{c.admissions.toLocaleString("en-IN")}</td>
                    <td className="p-4 font-bold text-white">{formatCurrency(c.grossAmount)}</td>
                    <td className="p-4 text-gray-400">
                      -{formatCurrency((c.gstAmount || 0) + (c.deductions || 0))}
                    </td>
                    <td className="p-4 font-semibold text-gray-200">{formatCurrency(c.netAmount)}</td>
                    <td className="p-4 font-extrabold text-emerald-400">
                      {formatCurrency(c.distributorAmt)} ({c.distributorSharePct}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: FINANCIAL LEDGER ─────────────────────────────────────── */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>Distributor Financial Ledger & Double-Entry Account</span>
              </h3>
              <p className="text-xs text-gray-400">
                Audited transactional ledger. Debits reflect tax invoices billed; Credits reflect verified payment receipts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdjustmentModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs border border-gray-700 transition"
              >
                + Manual Journal Adjustment
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ledger Statement</span>
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Entry Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Reference #</th>
                  <th className="p-4">Transaction Description</th>
                  <th className="p-4 text-right">Debit (₹)</th>
                  <th className="p-4 text-right">Credit (₹)</th>
                  <th className="p-4 text-right">Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {ledger.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300 font-sans">{formatDate(entry.entryDate)}</td>
                    <td className="p-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.category === "PAYMENT"
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                          : entry.category === "INVOICE"
                          ? "bg-brand-500/10 text-brand-400 border border-brand-500/30"
                          : "bg-gray-800 text-gray-300"
                      }`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{entry.referenceNumber}</td>
                    <td className="p-4 text-gray-300 font-sans">{entry.description}</td>
                    <td className="p-4 text-right font-bold text-amber-400">
                      {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : "—"}
                    </td>
                    <td className="p-4 text-right font-bold text-teal-400">
                      {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : "—"}
                    </td>
                    <td className="p-4 text-right font-extrabold text-white">
                      {formatCurrency(entry.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 5: INVOICES ────────────────────────────────────────────── */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Tax Invoices (Rule 46 GST)</h3>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Tax Invoice</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Base Amount</th>
                  <th className="p-4">CGST + SGST / IGST</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Paid Amount</th>
                  <th className="p-4">Balance Due</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-800/30">
                    <td className="p-4 font-bold text-brand-400">{inv.invoiceNumber}</td>
                    <td className="p-4 text-gray-300">{formatCurrency(inv.amountBeforeTax)}</td>
                    <td className="p-4 text-emerald-400 font-medium">
                      +{formatCurrency((inv.cgstAmount || 0) + (inv.sgstAmount || 0) + (inv.igstAmount || 0))}
                    </td>
                    <td className="p-4 font-bold text-white">{formatCurrency(inv.totalAmount)}</td>
                    <td className="p-4 font-bold text-teal-400">{formatCurrency(inv.paidAmount || 0)}</td>
                    <td className="p-4 font-extrabold text-amber-400">{formatCurrency(inv.balanceAmount)}</td>
                    <td className="p-4 font-sans text-gray-300">{formatDate(inv.dueDate)}</td>
                    <td className="p-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : inv.status === "PARTIALLY_PAID"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : inv.status === "OVERDUE"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-brand-500/10 text-brand-400 border border-brand-500/30"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 6: PAYMENTS ────────────────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Verified Payment Receipts</h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Verified Payment</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Paid Date</th>
                  <th className="p-4">Amount Received</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Bank Ref / UTR</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {payments.map((pay: any) => (
                  <tr key={pay.id} className="hover:bg-gray-800/30">
                    <td className="p-4 font-bold text-white font-mono">{pay.paymentNumber}</td>
                    <td className="p-4 text-gray-300">{formatDate(pay.paidAt || pay.createdAt)}</td>
                    <td className="p-4 font-extrabold text-teal-400">{formatCurrency(pay.amount)}</td>
                    <td className="p-4 font-semibold text-gray-200">{pay.paymentMethod}</td>
                    <td className="p-4 font-mono text-gray-300">{pay.transactionRef || "N/A"}</td>
                    <td className="p-4 text-gray-400 text-[11px]">{pay.verifiedBy || "Finance Team"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 7: REPORTS & AUDIT ──────────────────────────────────────── */}
      {activeTab === "reports" && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">Distributor Reconciliation Statement</h3>
              <p className="text-xs text-gray-400">Statement as on {formatDate(new Date())} for {profile.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF Statement</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
              <span className="text-gray-500 block font-sans">Total Billed</span>
              <span className="text-base font-bold text-white">{formatCurrency(fin.totalBilled)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
              <span className="text-gray-500 block font-sans">Total Received</span>
              <span className="text-base font-bold text-teal-400">{formatCurrency(fin.totalReceived)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
              <span className="text-gray-500 block font-sans">Closing Balance</span>
              <span className="text-base font-bold text-amber-400">{formatCurrency(fin.closingBalance)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800">
              <span className="text-gray-500 block font-sans">Overdue Dues</span>
              <span className="text-base font-bold text-red-400">{formatCurrency(fin.overdueAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: RECORD PAYMENT ────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base">Record Verified Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Payment Amount (INR) *</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 5000000"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Link to Invoice (Optional)</label>
                <select
                  value={payInvoiceId}
                  onChange={(e) => setPayInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                >
                  <option value="">On-Account (Advance / Settlement)</option>
                  {invoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — Balance: {formatCurrency(inv.balanceAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    <option value="RTGS_NEFT">RTGS / NEFT</option>
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="CHEQUE">Bank Cheque / DD</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Bank UTR / Ref No *</label>
                  <input
                    type="text"
                    value={payUtr}
                    onChange={(e) => setPayUtr(e.target.value)}
                    placeholder="e.g. HDFCR202610150998"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Transaction Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Cleared via HDFC Corporate Account"
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md"
                >
                  {submitting ? "Verifying..." : "Confirm & Post Credit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ISSUE TAX INVOICE ─────────────────────────────────────── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base">Generate Tax Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Base Amount Before Tax (INR) *</label>
                <input
                  type="number"
                  value={invBaseAmount}
                  onChange={(e) => setInvBaseAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="interstate"
                  checked={invIsInterstate}
                  onChange={(e) => setInvIsInterstate(e.target.checked)}
                  className="rounded border-gray-800 bg-gray-950 text-brand-600"
                />
                <label htmlFor="interstate" className="text-gray-300 font-medium cursor-pointer">
                  Inter-State Supply (IGST 18% instead of CGST 9% + SGST 9%)
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Payment Due Date</label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Invoice Description</label>
                <input
                  type="text"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md"
                >
                  {submitting ? "Computing..." : "Issue & Debit Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANUAL JOURNAL ADJUSTMENT ─────────────────────────────── */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base">Manual Ledger Adjustment</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostAdjustment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Entry Type *</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                  >
                    <option value="CREDIT">Credit (Reduces Balance)</option>
                    <option value="DEBIT">Debit (Increases Balance)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-400">Amount (INR) *</label>
                  <input
                    type="number"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    required
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Description *</label>
                <input
                  type="text"
                  value={adjDesc}
                  onChange={(e) => setAdjDesc(e.target.value)}
                  placeholder="e.g. Opening Balance Adjustment / Credit Note"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-400">Internal Audit Remarks</label>
                <input
                  type="text"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  placeholder="Authorized by Chief Financial Officer"
                  className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md"
                >
                  {submitting ? "Posting..." : "Post to Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
