"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  MapPin, 
  Package, 
  CircleDollarSign, 
  TrendingUp, 
  Plus, 
  Eye, 
  ArrowUpRight,
  Sparkles,
  ClipboardList
} from "lucide-react";

export default function AdminDashboard() {
  const [leadsCount, setLeadsCount] = useState(254);
  const [usersCount, setUsersCount] = useState(189);
  const [packagesCount, setPackagesCount] = useState(48);
  const [bookingsCount, setBookingsCount] = useState(38);
  const [revenueTotal, setRevenueTotal] = useState(2850000); // in INR
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const { count: leads } = await supabase.from("leads").select("*", { count: "exact", head: true });
        const { count: users } = await supabase.from("users").select("*", { count: "exact", head: true });
        const { count: pkgs } = await supabase.from("packages").select("*", { count: "exact", head: true });
        const { count: bookings } = await supabase.from("bookings").select("*", { count: "exact", head: true });
        
        if (leads !== null) setLeadsCount(leads);
        if (users !== null) setUsersCount(users);
        if (pkgs !== null) setPackagesCount(pkgs);
        if (bookings !== null) setBookingsCount(bookings);
      } catch (err) {
        console.warn("Failed fetching live dashboard counts, falling back to mock KPIs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">Workspace Overview</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Operational dashboard and CRM activity log.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-marigold text-white rounded-lg text-xs font-semibold hover:bg-marigold/90 shadow-sm transition">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Package</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Leads */}
        <div className="bg-white border border-border/40 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-dusk-teal uppercase tracking-wider">Total Leads</span>
            <span className="p-1.5 bg-marigold/10 text-marigold rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-ink-indigo">{leadsCount}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +14.2% this month
            </span>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white border border-border/40 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-dusk-teal uppercase tracking-wider">Active Users</span>
            <span className="p-1.5 bg-dusk-teal/10 text-dusk-teal rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-ink-indigo">{usersCount}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +8.5% this week
            </span>
          </div>
        </div>

        {/* Card 3: Packages */}
        <div className="bg-white border border-border/40 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-dusk-teal uppercase tracking-wider">Packages Created</span>
            <span className="p-1.5 bg-clay-rose/10 text-clay-rose rounded-lg"><Package className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-ink-indigo">{packagesCount}</h3>
            <span className="text-[10px] text-dusk-teal/80 mt-1">16 Destinations active</span>
          </div>
        </div>

        {/* Card 4: Bookings */}
        <div className="bg-white border border-border/40 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-dusk-teal uppercase tracking-wider">Bookings</span>
            <span className="p-1.5 bg-ink-indigo/10 text-ink-indigo rounded-lg"><MapPin className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-mono font-bold text-ink-indigo">{bookingsCount}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> 12 quotes pending
            </span>
          </div>
        </div>

        {/* Card 5: Revenue */}
        <div className="bg-white border border-border/40 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-dusk-teal uppercase tracking-wider">Revenue (Est)</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg"><CircleDollarSign className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-mono font-bold text-emerald-800">
              ₹{(revenueTotal / 100000).toFixed(1)}L
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +18.4% YoY growth
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Actions Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Funnel & AI usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversion Funnel Card */}
          <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-ink-indigo font-display">Travel Funnel Conversions</h3>
              <p className="text-[10px] text-dusk-teal">Quiz completions and lead capture rates.</p>
            </div>

            {/* Custom Funnel Chart using CSS Grid/Flex */}
            <div className="space-y-3 pt-2">
              {/* Funnel Step 1 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-deep-charcoal mb-1">
                  <span>1. Website Visitors</span>
                  <span className="font-mono">1,245 (100%)</span>
                </div>
                <div className="w-full h-3 bg-sand/35 rounded-full overflow-hidden">
                  <div className="h-full bg-ink-indigo w-full" />
                </div>
              </div>

              {/* Funnel Step 2 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-deep-charcoal mb-1">
                  <span>2. Started Questionnaire</span>
                  <span className="font-mono">754 (60.5%)</span>
                </div>
                <div className="w-full h-3 bg-sand/35 rounded-full overflow-hidden">
                  <div className="h-full bg-dusk-teal w-[60.5%]" />
                </div>
              </div>

              {/* Funnel Step 3 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-deep-charcoal mb-1">
                  <span>3. Generated Custom Itinerary</span>
                  <span className="font-mono">384 (30.8%)</span>
                </div>
                <div className="w-full h-3 bg-sand/35 rounded-full overflow-hidden">
                  <div className="h-full bg-marigold w-[30.8%]" />
                </div>
              </div>

              {/* Funnel Step 4 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-deep-charcoal mb-1">
                  <span>4. WhatsApp Lead Captured</span>
                  <span className="font-mono">254 (20.4%)</span>
                </div>
                <div className="w-full h-3 bg-sand/35 rounded-full overflow-hidden">
                  <div className="h-full bg-clay-rose w-[20.4%]" />
                </div>
              </div>

              {/* Funnel Step 5 */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-deep-charcoal mb-1">
                  <span>5. Paid Booking Checkout</span>
                  <span className="font-mono">38 (3.0%)</span>
                </div>
                <div className="w-full h-3 bg-sand/35 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-[3%]" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Usage & Provider Analytics */}
          <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink-indigo font-display">AI Provider Efficiency</h3>
                <p className="text-[10px] text-dusk-teal">API latency, calls, and estimated usage costs.</p>
              </div>
              <span className="p-1.5 bg-marigold/10 text-marigold rounded-full"><Sparkles className="w-4 h-4" /></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-sand/30 p-4 border border-border/20 rounded-lg">
                <span className="text-[10px] text-dusk-teal uppercase">Avg Latency</span>
                <h4 className="text-lg font-bold text-ink-indigo mt-1">1.84s</h4>
              </div>
              <div className="bg-sand/30 p-4 border border-border/20 rounded-lg">
                <span className="text-[10px] text-dusk-teal uppercase">Cost this Month</span>
                <h4 className="text-lg font-bold text-emerald-800 mt-1">$42.50</h4>
              </div>
              <div className="bg-sand/30 p-4 border border-border/20 rounded-lg">
                <span className="text-[10px] text-dusk-teal uppercase">Reliability Rate</span>
                <h4 className="text-lg font-bold text-emerald-800 mt-1">99.8%</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Review queue list */}
        <div className="space-y-6">
          <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-ink-indigo font-display">Recent Tasks & Logs</h3>
                <span className="p-1.5 bg-clay-rose/10 text-clay-rose rounded-full"><ClipboardList className="w-4 h-4" /></span>
              </div>

              {/* Task list simulation */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-sand/30 border border-border/20 rounded-lg flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-ink-indigo">Verify Singapore Comfort Draft</h5>
                    <p className="text-[10px] text-dusk-teal mt-0.5">Assigned to Agent: Saransh</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-marigold/10 text-marigold uppercase">Pending</span>
                </div>

                <div className="p-3 bg-sand/30 border border-border/20 rounded-lg flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-ink-indigo">Review Dubai Signature pricing</h5>
                    <p className="text-[10px] text-dusk-teal mt-0.5">Seasonality override required</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-clay-rose/10 text-clay-rose uppercase">Action Required</span>
                </div>

                <div className="p-3 bg-sand/30 border border-border/20 rounded-lg flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-ink-indigo">Supplier check: Gardens MBS ticket</h5>
                    <p className="text-[10px] text-dusk-teal mt-0.5">Updated base cost override</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 uppercase">Completed</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 mt-6">
              <a href="/admin/crm" className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-border/60 hover:bg-sand/30 text-xs font-semibold rounded-lg transition text-ink-indigo">
                <span>View CRM Sales Board</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
