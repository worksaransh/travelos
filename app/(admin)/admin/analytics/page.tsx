"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, HelpCircle, Users, Activity, Download } from "lucide-react";

export default function AnalyticsAdmin() {
  const [timeframe, setTimeframe] = useState("30d");

  // Mock data for display
  const stats = [
    { label: "Total Sessions", value: "32,840", growth: "+14.2%" },
    { label: "Questionnaire Starts", value: "18,920", growth: "+18.9%" },
    { label: "Completed Blueprints", value: "11,450", growth: "+11.5%" },
    { label: "Sales Conversions", value: "4.82%", growth: "+0.8%" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">Platform Analytics</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Monitor DNA questionnaire performance metrics, customer click behavior, and package configuration ratios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3.5 py-2 border border-border/60 rounded-lg text-xs font-semibold bg-white text-ink-indigo focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>

          <button className="flex items-center gap-1.5 px-3.5 py-2 border border-border/60 hover:bg-sand/30 rounded-lg text-xs font-semibold transition bg-white text-ink-indigo">
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-border/40 p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-dusk-teal tracking-wider">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-ink-indigo">{stat.value}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {stat.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Acquisition & Conversions Chart */}
        <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/10 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-marigold" />
              <h3 className="text-sm font-bold text-ink-indigo font-display">Daily Questionnaire Completion Volume</h3>
            </div>
          </div>

          {/* SVG Area Line Chart */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DF9F28" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#DF9F28" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f0ee" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f0ee" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f0ee" strokeWidth="1" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#f1f0ee" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M0,180 Q60,140 120,130 T240,90 T360,70 T480,50 L500,50 L500,200 L0,200 Z"
                fill="url(#chartGradient)"
              />

              {/* Trend line */}
              <path
                d="M0,180 Q60,140 120,130 T240,90 T360,70 T480,50 L500,50"
                fill="none"
                stroke="#DF9F28"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="120" cy="130" r="4.5" fill="#1C2D42" stroke="#DF9F28" strokeWidth="2" />
              <circle cx="240" cy="90" r="4.5" fill="#1C2D42" stroke="#DF9F28" strokeWidth="2" />
              <circle cx="360" cy="70" r="4.5" fill="#1C2D42" stroke="#DF9F28" strokeWidth="2" />
              <circle cx="480" cy="50" r="4.5" fill="#1C2D42" stroke="#DF9F28" strokeWidth="2" />

              {/* Labels */}
              <text x="0" y="195" fill="#5F758B" fontSize="9" fontWeight="bold">Week 1</text>
              <text x="120" y="195" fill="#5F758B" fontSize="9" fontWeight="bold">Week 2</text>
              <text x="240" y="195" fill="#5F758B" fontSize="9" fontWeight="bold">Week 3</text>
              <text x="360" y="195" fill="#5F758B" fontSize="9" fontWeight="bold">Week 4</text>
              <text x="450" y="195" fill="#5F758B" fontSize="9" fontWeight="bold">Week 5 (Current)</text>
            </svg>
          </div>
        </div>

        {/* Funnel Conversions */}
        <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-marigold" />
              <h3 className="text-sm font-bold text-ink-indigo font-display">Travel DNA Funnel Drop-off Rate</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>1. Questionnaire Opened</span>
                <span>100% (18,920 sessions)</span>
              </div>
              <div className="w-full bg-sand/30 h-6.5 rounded-lg overflow-hidden border border-border/20">
                <div className="bg-ink-indigo h-full flex items-center px-3 text-[10px] text-white font-bold" style={{ width: "100%" }}>
                  100%
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>2. Step 3 (Accommodations Preference) Saved</span>
                <span>72.4% (13,700 sessions)</span>
              </div>
              <div className="w-full bg-sand/30 h-6.5 rounded-lg overflow-hidden border border-border/20">
                <div className="bg-marigold h-full flex items-center px-3 text-[10px] text-ink-indigo font-bold" style={{ width: "72.4%" }}>
                  72.4%
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>3. Completed & Profile Rendered</span>
                <span>60.5% (11,450 sessions)</span>
              </div>
              <div className="w-full bg-sand/30 h-6.5 rounded-lg overflow-hidden border border-border/20">
                <div className="bg-dusk-teal/80 h-full flex items-center px-3 text-[10px] text-white font-bold" style={{ width: "60.5%" }}>
                  60.5%
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>4. WhatsApp Lead Generated (Gate 1 & 2)</span>
                <span>18.6% (3,520 users)</span>
              </div>
              <div className="w-full bg-sand/30 h-6.5 rounded-lg overflow-hidden border border-border/20">
                <div className="bg-clay-rose/80 h-full flex items-center px-3 text-[10px] text-white font-bold" style={{ width: "18.6%" }}>
                  18.6%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Packages & AI token stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Popular Destinations */}
        <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm space-y-4 xl:col-span-2">
          <div className="flex items-center gap-2 border-b border-border/10 pb-3">
            <BarChart3 className="w-4.5 h-4.5 text-marigold" />
            <h3 className="text-sm font-bold text-ink-indigo font-display">Popular Cities by Blueprint Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { name: "Singapore", count: "4,820 clicks", share: "42%", color: "bg-ink-indigo" },
              { name: "Dubai", count: "2,980 clicks", share: "26%", color: "bg-marigold" },
              { name: "Bali (Denpasar)", count: "1,850 clicks", share: "16%", color: "bg-dusk-teal/70" },
              { name: "Male (Maldives)", count: "1,140 clicks", share: "10%", color: "bg-clay-rose/70" }
            ].map((city, idx) => (
              <div key={idx} className="p-3 bg-sand/20 border border-border/20 rounded-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold text-ink-indigo">{city.name}</div>
                  <div className="text-[10px] text-dusk-teal">{city.count}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-deep-charcoal">{city.share}</span>
                  <div className="w-16 bg-sand h-1.5 rounded-full overflow-hidden mt-1">
                    <div className={`${city.color} h-full`} style={{ width: city.share }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Usage stats */}
        <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/10 pb-3">
            <Activity className="w-4.5 h-4.5 text-marigold" />
            <h3 className="text-sm font-bold text-ink-indigo font-display">AI Engine Response Calibration</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-2">
              <span className="font-bold text-ink-indigo">Active Provider:</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                Gemini-1.5-Pro
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Avg Generation Latency:</span>
                <span>2.8 seconds</span>
              </div>
              <div className="w-full bg-sand/30 h-2 rounded-full overflow-hidden">
                <div className="bg-marigold h-full" style={{ width: "35%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>LLM Output Validation Accuracy:</span>
                <span>99.2%</span>
              </div>
              <div className="w-full bg-sand/30 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: "99.2%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Daily Token Usage Quota:</span>
                <span>4.2M / 10M tokens</span>
              </div>
              <div className="w-full bg-sand/30 h-2 rounded-full overflow-hidden">
                <div className="bg-ink-indigo h-full" style={{ width: "42%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
