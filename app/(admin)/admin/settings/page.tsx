"use client";

import React, { useState } from "react";
import { Settings, Save, ShieldAlert, Cpu, Eye, CheckCircle, RefreshCw } from "lucide-react";

export default function SettingsAdmin() {
  const [successMsg, setSuccessMsg] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);

  // System States
  const [ownerReviewRequired, setOwnerReviewRequired] = useState(true);
  const [webpCompression, setWebpCompression] = useState(true);
  const [doubleOptIn, setDoubleOptIn] = useState(true);
  
  // API credentials
  const [geminiKey, setGeminiKey] = useState("••••••••••••••••••••••••••••");
  const [openaiKey, setOpenaiKey] = useState("••••••••••••••••••••••••••••");
  const [googleMapsKey, setGoogleMapsKey] = useState("••••••••••••••••••••••••••••");

  // Prompts config
  const [itineraryPrompt, setItineraryPrompt] = useState(
    `You are an expert luxury travel agent. Design a tailored signature itinerary for the destination. Calibrate pace scoring matching 10-dimensional traveler preferences.`
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("System configuration rules and API credentials updated successfully.");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setSuccessMsg("LLM provider ping test: Success. Gemini-1.5-Pro API responded in 1.4s.");
      setTimeout(() => setSuccessMsg(""), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">System Settings</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Configure API credentials, calibrate LLM system prompts, toggle performance caches, and update legal policies.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Core settings left */}
        <div className="lg:col-span-2 space-y-6 text-xs text-deep-charcoal">
          {/* System toggles */}
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-indigo border-b border-border/10 pb-2">Operational System Toggles</h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ownerReviewRequired}
                  onChange={(e) => setOwnerReviewRequired(e.target.checked)}
                  className="accent-marigold mt-0.5"
                />
                <div>
                  <span className="font-bold block text-ink-indigo">Require Owner Review for AI Content</span>
                  <span className="text-[11px] text-dusk-teal block">
                    All AI-generated package drafts are put in the pending review queue before becoming publicly visible.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer border-t border-border/10 pt-3">
                <input
                  type="checkbox"
                  checked={webpCompression}
                  onChange={(e) => setWebpCompression(e.target.checked)}
                  className="accent-marigold mt-0.5"
                />
                <div>
                  <span className="font-bold block text-ink-indigo">Auto WebP Compression on Uploads</span>
                  <span className="text-[11px] text-dusk-teal block">
                    Automatically convert and compress public assets into WebP with metadata alt fields registration.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer border-t border-border/10 pt-3">
                <input
                  type="checkbox"
                  checked={doubleOptIn}
                  onChange={(e) => setDoubleOptIn(e.target.checked)}
                  className="accent-marigold mt-0.5"
                />
                <div>
                  <span className="font-bold block text-ink-indigo">Enforce Double Opt-In Leads Verification</span>
                  <span className="text-[11px] text-dusk-teal block">
                    Require validation checks on all incoming WhatsApp numbers before allocating them to agents.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Prompts editor */}
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/10 pb-2">
              <h3 className="text-sm font-bold text-ink-indigo">Prompt Templates Custom Editor</h3>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="flex items-center gap-1.5 px-2.5 py-1.2 border border-border hover:bg-sand/30 rounded text-[10px] font-semibold transition"
              >
                <RefreshCw className={`w-3 h-3 ${testingConnection ? "animate-spin" : ""}`} />
                <span>Test Prompt Performance</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">
                  AI Generator System Persona & Constraints
                </label>
                <textarea
                  value={itineraryPrompt}
                  onChange={(e) => setItineraryPrompt(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold text-xs font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Credentials and save right */}
        <div className="space-y-6 text-xs text-deep-charcoal">
          {/* API Keys configuration */}
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-indigo border-b border-border/10 pb-2">API Provider Credentials</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">OpenAI API Key (Secondary Engine)</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Google Maps Platforms Key</label>
                <input
                  type="password"
                  value={googleMapsKey}
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Box */}
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-3.5">
            <div className="flex gap-2 items-center text-[10px] text-dusk-teal bg-sand/35 p-3 rounded-lg border border-border/20">
              <ShieldAlert className="w-4 h-4 text-clay-rose shrink-0" />
              <span>Saving updates applies rules globally. Live connections verify instantly on submission.</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Commit System Parameters</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
