"use client";

import React, { useState, useEffect } from "react";
import {
  KanbanSquare,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  UserCheck,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STAGES = [
  { key: "NEW_LEAD", label: "New Leads", color: "border-t-brand-500" },
  { key: "CONTACTED", label: "Contacted / Pitch", color: "border-t-purple-500" },
  { key: "PROPOSAL", label: "Proposal Sent", color: "border-t-amber-500" },
  { key: "NEGOTIATING", label: "Negotiating MG/Share", color: "border-t-orange-500" },
  { key: "CLOSED_WON", label: "Closed Won", color: "border-t-emerald-500" },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "border-t-red-500" },
];

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New Lead form
  const [title, setTitle] = useState("");
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dealValue, setDealValue] = useState("1500000");
  const [stage, setStage] = useState("NEW_LEAD");
  const [creating, setCreating] = useState(false);

  const fetchLeads = () => {
    fetch("/api/crm/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeads(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const moveStage = async (leadId: string, currentStage: string, direction: "next" | "prev") => {
    const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= STAGES.length) return;

    const newStage = STAGES[nextIndex].key;

    // Optimistic state update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );

    await fetch("/api/crm/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, stage: newStage, dealValue: 1500000, probability: 70 }),
    });
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contactName, companyName, email, phone, dealValue, stage }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setTitle("");
        setContactName("");
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-brand-500" />
            <span>CRM & Distribution Sales Pipeline</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track deal opportunities, theater circuit outreach, and stage movements in real-time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs">
            <span className="text-gray-400">Total Pipeline: </span>
            <span className="font-extrabold text-brand-500">{formatCurrency(totalPipelineValue)}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead Opportunity</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto custom-scrollbar pb-4">
        {STAGES.map((col) => {
          const colLeads = leads.filter((l) => l.stage === col.key);
          const colValue = colLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

          return (
            <div
              key={col.key}
              className={`glass-panel p-3 rounded-2xl space-y-3 border-t-4 ${col.color} bg-gray-50/50 dark:bg-gray-950/60 min-w-[220px]`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-gray-800">
                <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {col.label}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {colLeads.length}
                </span>
              </div>

              <div className="text-[10px] text-gray-400 font-semibold">
                Val: {formatCurrency(colValue)}
              </div>

              <div className="space-y-3 min-h-[350px]">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md transition space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white line-clamp-2">
                        {lead.title}
                      </h4>
                    </div>

                    <div className="text-[11px] text-brand-500 font-bold">
                      {formatCurrency(lead.dealValue || 0)}
                    </div>

                    <div className="space-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        {lead.companyName || lead.contactName}
                      </p>
                      <p>{lead.phone || lead.email}</p>
                    </div>

                    {/* Stage shift actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px]">
                      <button
                        onClick={() => moveStage(lead.id, lead.stage, "prev")}
                        disabled={col.key === "NEW_LEAD"}
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[9px] font-bold text-emerald-500">
                        {lead.probability || 50}% Win Prob
                      </span>

                      <button
                        onClick={() => moveStage(lead.id, lead.stage, "next")}
                        disabled={col.key === "CLOSED_LOST"}
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Add New Sales Lead
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400">Opportunity Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. INOX South India Circuit Deal"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="PVR INOX Ltd"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Contact Person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Vikram Oberoi"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md"
                >
                  {creating ? "Adding..." : "Add to Kanban"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
