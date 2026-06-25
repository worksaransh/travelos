"use client";

import React, { useState } from "react";
import { CircleDollarSign, Plus, Check, RefreshCw, Sparkles, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  isActive: boolean;
}

export default function PricingEngine() {
  // Global pricing configuration state
  const [baseMargin, setBaseMargin] = useState(15); // in %
  const [serviceFee, setServiceFee] = useState(4500); // in INR
  const [taxRate, setTaxRate] = useState(5); // in % (GST)
  const [seasonalityMultiplier, setSeasonalityMultiplier] = useState(1.15); // Peak coefficient
  const [successMsg, setSuccessMsg] = useState("");

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: "EXPLORE10", type: "percent", value: 10, isActive: true },
    { code: "FESTIVAL5000", type: "fixed", value: 5000, isActive: true },
    { code: "EARLYBIRD", type: "percent", value: 15, isActive: false }
  ]);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newValue, setNewValue] = useState(10);

  // Pricing Simulator State
  const [simBaseCost, setSimBaseCost] = useState(82000);
  const [simAddons, setSimAddons] = useState(15000);
  const [simSeason, setSimSeason] = useState("peak"); // standard | peak | off-season
  const [simCouponCode, setSimCouponCode] = useState("EXPLORE10");
  const [simOverridePrice, setSimOverridePrice] = useState<number | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Global pricing parameters updated successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCoupons([
      ...coupons,
      { code: newCode.toUpperCase().trim(), type: newType, value: newValue, isActive: true }
    ]);
    setNewCode("");
  };

  const toggleCoupon = (code: string) => {
    setCoupons(
      coupons.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Pricing Simulator Calculator
  const calculatedPricing = (() => {
    const rawCost = simBaseCost + simAddons;

    // Apply Margin
    const marginAmount = rawCost * (baseMargin / 100);
    let subtotal = rawCost + marginAmount;

    // Apply Service Fee
    subtotal += serviceFee;

    // Apply Seasonality Multiplier
    const seasonCoeff = simSeason === "peak" ? seasonalityMultiplier : simSeason === "off-season" ? 0.90 : 1.0;
    const seasonAmount = subtotal * (seasonCoeff - 1);
    subtotal += seasonAmount;

    // Apply Coupon Code if active
    let couponDeduction = 0;
    const activeCoupon = coupons.find(c => c.code === simCouponCode && c.isActive);
    if (activeCoupon) {
      if (activeCoupon.type === "percent") {
        couponDeduction = subtotal * (activeCoupon.value / 100);
      } else {
        couponDeduction = activeCoupon.value;
      }
    }
    subtotal -= couponDeduction;

    // Apply Tax (GST)
    const taxAmount = subtotal * (taxRate / 100);
    const finalPrice = subtotal + taxAmount;

    return {
      rawCost,
      marginAmount,
      seasonAmount,
      couponDeduction,
      taxAmount,
      finalPrice: simOverridePrice !== null ? simOverridePrice : finalPrice
    };
  })();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Pricing Engine</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Configure markup margins, service fees, peak multipliers, active discount campaigns, and quote calculations.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Configuration panel & Coupons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Global Multipliers Form */}
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-ink-indigo font-display mb-4 flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-marigold" />
              <span>Global Cost & Markup Parameters</span>
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Base Profit Margin (%)</label>
                  <input
                    type="number"
                    value={baseMargin}
                    onChange={(e) => setBaseMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                    min={0}
                    max={100}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Fixed Service Fee (INR)</label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Peak Season Multiplier Coefficient</label>
                  <input
                    type="number"
                    value={seasonalityMultiplier}
                    onChange={(e) => setSeasonalityMultiplier(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                    step="0.05"
                    min={1.0}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Government Tax Rate (GST %)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                    min={0}
                    max={50}
                  />
                </div>
              </div>

              <Button type="submit" className="bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2 px-6 font-semibold transition">
                Update Pricing Rulebook
              </Button>
            </form>
          </div>

          {/* Coupon Campaigns list */}
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-indigo font-display flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-clay-rose" />
              <span>Discount Campaigns & Promo Codes</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add Coupon code form */}
              <div className="md:col-span-1 border-r border-border/20 pr-0 md:pr-6 space-y-3">
                <h4 className="font-semibold text-deep-charcoal text-xs">Create Promo:</h4>
                <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-dusk-teal mb-1">Code</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg uppercase font-mono font-bold"
                      placeholder="TRIP2026"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-dusk-teal mb-1">Type</label>
                      <select
                        value={newType}
                        onChange={(e: any) => setNewType(e.target.value)}
                        className="w-full px-2 py-2 border border-border/60 rounded-lg bg-white"
                      >
                        <option value="percent">%</option>
                        <option value="fixed">INR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-dusk-teal mb-1">Value</label>
                      <input
                        type="number"
                        value={newValue}
                        onChange={(e) => setNewValue(Number(e.target.value))}
                        className="w-full px-2 py-2 border border-border/60 rounded-lg font-mono"
                        min={1}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-ink-indigo hover:bg-ink-indigo/90 text-white rounded-lg py-2 font-semibold">
                    Register Code
                  </Button>
                </form>
              </div>

              {/* Coupons List view */}
              <div className="md:col-span-2 space-y-2 max-h-48 overflow-y-auto">
                <h4 className="font-semibold text-deep-charcoal text-xs">Campaign Database:</h4>
                <div className="space-y-2 text-xs">
                  {coupons.map((c) => (
                    <div key={c.code} className="flex justify-between items-center p-3 border border-border/40 rounded-xl bg-sand/10 hover:bg-sand/20 transition">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-ink-indigo">{c.code}</span>
                        <span className="text-[10px] text-dusk-teal">
                          {c.type === "percent" ? `${c.value}% discount` : `₹${c.value.toLocaleString("en-IN")} flat discount`}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleCoupon(c.code)}
                        className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold ${
                          c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {c.isActive ? "Active" : "Paused"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Pricing calculator Simulator */}
        <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-ink-indigo font-display flex items-center gap-1.5 border-b border-border/20 pb-3">
            <Sparkles className="w-4 h-4 text-marigold" />
            <span>Interactive Quote Calculator</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">Base Package Price (INR)</label>
              <input
                type="number"
                value={simBaseCost}
                onChange={(e) => setSimBaseCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border/60 rounded-lg font-mono text-ink-indigo"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">Addon Upgrades (INR)</label>
              <input
                type="number"
                value={simAddons}
                onChange={(e) => setSimAddons(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border/60 rounded-lg font-mono text-ink-indigo"
              />
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">Seasonality Factor</label>
              <select
                value={simSeason}
                onChange={(e) => setSimSeason(e.target.value)}
                className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white"
              >
                <option value="standard">Standard season (1.0x)</option>
                <option value="peak">Peak season ({seasonalityMultiplier}x)</option>
                <option value="off-season">Off-season (0.9x)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-deep-charcoal mb-1">Promo Code</label>
              <select
                value={simCouponCode}
                onChange={(e) => setSimCouponCode(e.target.value)}
                className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white font-mono"
              >
                <option value="">None</option>
                {coupons.filter(c => c.isActive).map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-dashed border-border/40 pt-4 space-y-2.5 font-mono text-[11px] text-dusk-teal">
              <div className="flex justify-between">
                <span>Base + Addons:</span>
                <span>₹{(simBaseCost + simAddons).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Margin (+{baseMargin}%):</span>
                <span>₹{calculatedPricing.marginAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (Fixed):</span>
                <span>+₹{serviceFee.toLocaleString("en-IN")}</span>
              </div>
              {calculatedPricing.seasonAmount !== 0 && (
                <div className="flex justify-between">
                  <span>Seasonality delta:</span>
                  <span>{calculatedPricing.seasonAmount >= 0 ? "+" : "-"}₹{Math.abs(calculatedPricing.seasonAmount).toLocaleString("en-IN")}</span>
                </div>
              )}
              {calculatedPricing.couponDeduction > 0 && (
                <div className="flex justify-between text-clay-rose font-bold">
                  <span>Deduction ({simCouponCode}):</span>
                  <span>-₹{calculatedPricing.couponDeduction.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax ({taxRate}%):</span>
                <span>₹{calculatedPricing.taxAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="border-t border-border/30 pt-3 flex justify-between items-center text-xs font-bold text-ink-indigo">
                <span>Final Invoice Price:</span>
                <span className="text-lg font-bold text-emerald-800 font-mono">
                  ₹{Math.round(calculatedPricing.finalPrice).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Custom override */}
            <div className="border-t border-border/20 pt-4 mt-2">
              <label className="block text-[10px] font-semibold text-clay-rose mb-1">Manual Override Price (Agent Override)</label>
              <input
                type="number"
                value={simOverridePrice || ""}
                onChange={(e) => setSimOverridePrice(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-clay-rose/40 rounded-lg font-mono text-clay-rose font-bold"
                placeholder="₹ Override amount"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
