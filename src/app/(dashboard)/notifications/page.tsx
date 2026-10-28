"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, FileCheck2, CreditCard, Sparkles, MessageSquare, PhoneCall } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifications(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = notifications.filter((n) => filter === "ALL" || n.type === filter);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-500" />
            <span>Notification & Communication Center</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time system alerts, deal milestones, payment overdue triggers, and WhatsApp/SMS webhooks.
          </p>
        </div>

        <button
          onClick={() => alert("All notifications marked as read")}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Mark All Read
        </button>
      </div>

      {/* Webhook Readiness Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500 text-xs">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">WhatsApp Business Webhook</span>
              <span className="text-gray-400 text-[10px]">Instant deal PDF delivery over WhatsApp</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Ready</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-brand-500 text-xs">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-5 h-5 text-brand-500" />
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">SMS Alert Webhook</span>
              <span className="text-gray-400 text-[10px]">OTP verification & payment reminders</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500">Ready</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {["ALL", "DEAL", "PAYMENT", "AI", "SYSTEM"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === t
                ? "bg-brand-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="glass-panel p-4 rounded-2xl flex items-start gap-4 border border-gray-200 dark:border-gray-800 hover:border-brand-500/30 transition"
          >
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 shrink-0">
              {n.type === "DEAL" && <FileCheck2 className="w-5 h-5" />}
              {n.type === "PAYMENT" && <CreditCard className="w-5 h-5 text-amber-500" />}
              {n.type === "AI" && <Sparkles className="w-5 h-5 text-purple-500" />}
              {n.type === "SYSTEM" && <Bell className="w-5 h-5" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {n.title}
                </h4>
                <span className="text-[10px] text-gray-400">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
