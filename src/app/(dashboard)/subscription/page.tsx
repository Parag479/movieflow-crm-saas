"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, Sparkles, Zap, Building } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter Tier",
    priceMonthly: 2999,
    priceAnnual: 29999,
    desc: "Designed for independent theater owners and single-circuit distributors.",
    features: [
      "Up to 5 Movies Catalog",
      "Up to 2 Theaters (5 Screens)",
      "Standard Revenue Share Calculator",
      "Manual Show Scheduling",
      "Basic Sales CRM",
      "Email Support",
    ],
  },
  {
    name: "Professional Tier",
    priceMonthly: 4999,
    priceAnnual: 49999,
    popular: true,
    desc: "For growing production houses and multi-city theater chains.",
    features: [
      "Unlimited Movie Master Records",
      "Up to 15 Theaters (50 Screens)",
      "Automated PDF Agreement Contracts",
      "Screen Conflict Detection Engine",
      "GST Tax Invoice Generation",
      "Kanban Sales Pipeline",
      "Priority WhatsApp Support",
    ],
  },
  {
    name: "Enterprise Tier",
    priceMonthly: 9999,
    priceAnnual: 99999,
    desc: "Complete enterprise suite with AI demand predictor and unlimited scale.",
    features: [
      "Unlimited Everything",
      "AI Revenue Forecast Suite",
      "Movie Demand Predictor Engine",
      "Theater Recommendation AI",
      "Multi-Tenant Tenant Switching",
      "Custom Branding & Domain",
      "Dedicated Account Manager",
      "24/7 SLA Guarantee",
    ],
  },
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold border border-brand-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>SaaS Subscription & Tenant Licensing</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Flexible Pricing Built for Movie Scale
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Scale seamlessly from single screen exhibitors to national film distribution networks.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-semibold ${billingCycle === "MONTHLY" ? "text-white" : "text-gray-400"}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "MONTHLY" ? "ANNUAL" : "MONTHLY")}
            className="w-14 h-8 rounded-full bg-brand-600 p-1 transition-all flex items-center"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                billingCycle === "ANNUAL" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${billingCycle === "ANNUAL" ? "text-white" : "text-gray-400"}`}>
            Annual Billing <span className="text-emerald-400 text-[10px] font-bold">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Active Subscription Badge */}
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-xs flex items-center justify-between text-brand-500 font-semibold">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Current Active Plan: <strong>ENTERPRISE TIER</strong> (Unlimited Access)</span>
        </div>
        <span>Renews: July 22, 2027</span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((p) => {
          const price = billingCycle === "ANNUAL" ? p.priceAnnual : p.priceMonthly;

          return (
            <div
              key={p.name}
              className={`glass-panel p-6 rounded-3xl space-y-6 relative flex flex-col justify-between border ${
                p.popular ? "border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/50" : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-brand-600 to-cinema-accent text-white shadow-md uppercase tracking-wider">
                  Most Popular for Distributors
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[32px]">{p.desc}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-xs text-gray-400">/{billingCycle === "ANNUAL" ? "year" : "month"}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => alert(`Upgraded to ${p.name}!`)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                  p.popular
                    ? "bg-brand-600 hover:bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                Select Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
