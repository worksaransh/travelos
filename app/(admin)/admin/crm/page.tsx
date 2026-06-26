"use client";

import React, { useState, useEffect } from "react";

import { supabase, updateLeadStage } from "@/lib/supabase";
import { decryptLeadData } from "@/lib/utils";
import { Plus, Kanban as KanbanIcon, ListFilter, Phone, Mail, FileText, CheckSquare, ChevronRight, AlertTriangle } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  capture_gate: "gate1_whatsapp" | "gate2_full";
  preferred_contact_time?: string;
  consent_given: boolean;
  created_at: string;
  stage: "New" | "Contacted" | "Proposal" | "Negotiating" | "Booked" | "Lost";
  value: number;
}

const pipelineStages = [
  { name: "New", color: "border-sky-500 bg-sky-500/10 text-sky-700" },
  { name: "Contacted", color: "border-amber-500 bg-amber-500/10 text-amber-700" },
  { name: "Proposal", color: "border-indigo-500 bg-indigo-500/10 text-indigo-700" },
  { name: "Negotiating", color: "border-purple-500 bg-purple-500/10 text-purple-700" },
  { name: "Booked", color: "border-emerald-500 bg-emerald-500/10 text-emerald-700" },
  { name: "Lost", color: "border-rose-500 bg-rose-500/10 text-rose-700" }
];

export default function LeadCRMAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activityType, setActivityType] = useState<"call" | "email" | "note" | "task">("call");
  const [activityText, setActivityText] = useState("");
  const [activitiesLog, setActivitiesLog] = useState<{ id: string; leadId: string; type: string; text: string; date: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map Supabase leads to stages (reading the persistent database column)
      const formatted: Lead[] = (data || []).map((l: any) => {
        const decryptedWhatsapp = decryptLeadData(l.whatsapp_number || "");
        const decryptedEmail = decryptLeadData(l.email || "");
        return {
          id: l.id,
          name: l.name || `WhatsApp Lead ${decryptedWhatsapp}`,
          email: decryptedEmail || "no-email@journey.os",
          whatsapp_number: decryptedWhatsapp,
          capture_gate: l.capture_gate || "gate1_whatsapp",
          preferred_contact_time: l.preferred_contact_time || "Morning",
          consent_given: l.consent_given,
          created_at: l.created_at,
          stage: l.stage || "New", // persistent DB column fallback to New
          value: l.capture_gate === "gate2_full" ? 5400 : 1800
        };
      });

      setLeads(formatted);
    } catch (err: any) {
      console.warn("Failed to load leads from Supabase. Showing mock data:", err.message);
      // Fallback Seed Mocks
      setLeads([
        {
          id: "lead-1",
          name: "Saransh Gulati",
          email: "saransh@gmail.com",
          whatsapp_number: "+91 98765 43210",
          capture_gate: "gate2_full",
          preferred_contact_time: "Evening (4 PM - 7 PM)",
          consent_given: true,
          created_at: new Date().toISOString(),
          stage: "New",
          value: 4500
        },
        {
          id: "lead-2",
          name: "Amara Tan",
          email: "amara.tan@singapore.com",
          whatsapp_number: "+65 8123 4567",
          capture_gate: "gate1_whatsapp",
          preferred_contact_time: "Anytime",
          consent_given: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          stage: "Contacted",
          value: 1200
        },
        {
          id: "lead-3",
          name: "Devin Miller",
          email: "devin.miller@tech.io",
          whatsapp_number: "+1 (555) 019-2834",
          capture_gate: "gate2_full",
          preferred_contact_time: "Morning",
          consent_given: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          stage: "Proposal",
          value: 9200
        },
        {
          id: "lead-4",
          name: "Zoe Dupont",
          email: "zoe.d@paris.fr",
          whatsapp_number: "+33 6 1234 5678",
          capture_gate: "gate1_whatsapp",
          preferred_contact_time: "Afternoon",
          consent_given: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          stage: "Negotiating",
          value: 3100
        },
        {
          id: "lead-5",
          name: "Rajesh Kumar",
          email: "rajesh.k@mumbai.co.in",
          whatsapp_number: "+91 99999 88888",
          capture_gate: "gate2_full",
          preferred_contact_time: "Evening",
          consent_given: true,
          created_at: new Date(Date.now() - 345600000).toISOString(),
          stage: "Booked",
          value: 6800
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const moveLead = async (leadId: string, newStage: Lead["stage"]) => {
    // Update local state first
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      await updateLeadStage(leadId, newStage);
    } catch (err) {
      console.error("Failed to update lead status in DB:", err);
    }
  };

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activityText.trim()) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      leadId: selectedLead.id,
      type: activityType,
      text: activityText,
      date: new Date().toLocaleString()
    };

    setActivitiesLog(prev => [newActivity, ...prev]);
    setActivityText("");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">Lead CRM Pipeline</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Monitor sales conversions, contact times, consent registries, and log agent interactions.
          </p>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Kanban columns */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.name);
            const totalValue = stageLeads.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div key={stage.name} className="flex flex-col min-w-[200px] bg-white border border-border/40 rounded-xl p-3 shadow-sm space-y-3 shrink-0">
                {/* Stage Title */}
                <div className="flex justify-between items-center border-b border-border/10 pb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${stage.color}`}>
                    {stage.name} ({stageLeads.length})
                  </span>
                  <span className="text-[10px] font-semibold text-dusk-teal">${totalValue}</span>
                </div>

                {/* Lead Cards inside Column */}
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {stageLeads.length > 0 ? (
                    stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`p-3 bg-sand/10 border rounded-lg cursor-pointer transition text-left space-y-2 hover:bg-sand/30 hover:border-marigold ${
                          selectedLead?.id === lead.id ? "border-marigold bg-marigold/5" : "border-border/30"
                        }`}
                      >
                        <div className="font-bold text-xs text-ink-indigo truncate">{lead.name}</div>
                        <div className="text-[10px] text-dusk-teal flex flex-col gap-0.5">
                          <span className="truncate">{lead.whatsapp_number || "No WhatsApp"}</span>
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-border/10">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            lead.capture_gate === "gate2_full" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
                          }`}>
                            {lead.capture_gate === "gate2_full" ? "Gate 2" : "Gate 1"}
                          </span>
                          <span className="text-[10px] font-bold text-ink-indigo">${lead.value}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-center text-dusk-teal/60 italic py-6">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead Activity Details Panel */}
        <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
          {selectedLead ? (
            <div className="space-y-4 text-xs">
              <div className="border-b border-border/20 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-ink-indigo font-display text-sm">{selectedLead.name}</h3>
                  <span className="text-[10px] text-dusk-teal">{selectedLead.email}</span>
                </div>
                <span className="text-[10px] bg-sand px-2 py-0.5 rounded font-mono font-bold text-ink-indigo">
                  ${selectedLead.value}
                </span>
              </div>

              {/* CRM Info fields */}
              <div className="space-y-1 bg-sand/20 p-3 rounded-lg border border-border/20 text-[11px] leading-relaxed">
                <div><strong>WhatsApp:</strong> {selectedLead.whatsapp_number}</div>
                <div><strong>Preferred Call Time:</strong> {selectedLead.preferred_contact_time || "N/A"}</div>
                <div><strong>Consent Version:</strong> v1.2 (Active)</div>
                <div><strong>Consent Date:</strong> {new Date(selectedLead.created_at).toLocaleDateString()}</div>
                <div><strong>Lead Created:</strong> {new Date(selectedLead.created_at).toLocaleString()}</div>
              </div>

              {/* Stage Mover Selector */}
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Update Pipeline Stage</label>
                <select
                  value={selectedLead.stage}
                  onChange={(e) => moveLead(selectedLead.id, e.target.value as Lead["stage"])}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold text-xs font-semibold text-ink-indigo"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Booked">Booked</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Activity Logger Form */}
              <form onSubmit={handleLogActivity} className="space-y-3 border-t border-border/20 pt-3">
                <div className="font-bold text-ink-indigo text-[11px]">Log Interaction / Activity</div>
                <div className="flex gap-2">
                  {(["call", "email", "note", "task"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityType(type)}
                      className={`flex-1 text-[10px] py-1 border rounded capitalize transition font-semibold ${
                        activityType === type
                          ? "bg-marigold text-white border-marigold"
                          : "border-border hover:bg-sand/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <textarea
                  value={activityText}
                  onChange={(e) => setActivityText(e.target.value)}
                  placeholder={`Write activity note or log ${activityType} outcome...`}
                  className="w-full h-16 p-2 border border-border/60 rounded-lg text-xs resize-none focus:outline-none focus:border-marigold"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-ink-indigo hover:bg-ink-indigo/90 text-white rounded-lg py-2 font-semibold transition text-center"
                >
                  Log Activity
                </button>
              </form>

              {/* Interactive history logs */}
              <div className="border-t border-border/20 pt-3 space-y-2">
                <div className="font-bold text-ink-indigo text-[11px]">Activity History</div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {activitiesLog.filter(act => act.leadId === selectedLead.id).length > 0 ? (
                    activitiesLog
                      .filter(act => act.leadId === selectedLead.id)
                      .map(act => (
                        <div key={act.id} className="bg-sand/10 border border-border/20 p-2.5 rounded-lg space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-ink-indigo capitalize bg-sand px-1.5 py-0.5 rounded">
                              {act.type}
                            </span>
                            <span className="text-[9px] text-dusk-teal">{act.date}</span>
                          </div>
                          <div className="text-[10px] text-deep-charcoal leading-relaxed">{act.text}</div>
                        </div>
                      ))
                  ) : (
                    <div className="text-[10px] text-center text-dusk-teal/60 italic py-2">
                      No activities logged yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-center text-dusk-teal/60 italic py-16 flex flex-col items-center gap-2">
              <KanbanIcon className="w-8 h-8 text-dusk-teal/30" />
              <span>Select a lead card to check logs, change stage, and capture client history.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
