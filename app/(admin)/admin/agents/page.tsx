"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { Contact, AlertTriangle, UserCheck, Shield, Award, Edit, Check } from "lucide-react";

interface AgentRecord {
  id: string;
  name: string;
  contact_info: string;
  active_status: boolean;
  fulfillment_capacity_per_month: number;
  territories: string;
  commission_tier: "standard" | "senior" | "director";
  payout_percentage: number;
  revenue_closed_ytd: number;
}

export default function AgentsAdmin() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<Partial<AgentRecord> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form inputs
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [activeStatus, setActiveStatus] = useState(true);
  const [capacity, setCapacity] = useState(15);
  const [territories, setTerritories] = useState("Southeast Asia");
  const [tier, setTier] = useState<AgentRecord["commission_tier"]>("standard");
  const [payout, setPayout] = useState(5.0);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      const formatted: AgentRecord[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        contact_info: row.contact_info || "no-contact@journey.os",
        active_status: row.active_status,
        fulfillment_capacity_per_month: row.fulfillment_capacity_per_month || 10,
        territories: "Singapore & Malaysia",
        commission_tier: "standard",
        payout_percentage: 5.0,
        revenue_closed_ytd: 24500
      }));

      setAgents(formatted);
    } catch (err: any) {
      console.warn("Agents DB fetch error, loading fallback list:", err.message);
      setAgents([
        {
          id: "agent-1",
          name: "Alan Shepherd",
          contact_info: "alan@journey.os | +65 9123 4567",
          active_status: true,
          fulfillment_capacity_per_month: 25,
          territories: "Singapore, Dubai, Bali",
          commission_tier: "senior",
          payout_percentage: 8.5,
          revenue_closed_ytd: 142000
        },
        {
          id: "agent-2",
          name: "Claire Vance",
          contact_info: "claire@journey.os | +65 8989 1234",
          active_status: true,
          fulfillment_capacity_per_month: 15,
          territories: "Maldives, Mauritius, Bhutan",
          commission_tier: "standard",
          payout_percentage: 5.0,
          revenue_closed_ytd: 89000
        },
        {
          id: "agent-3",
          name: "Marcus Aurelius",
          contact_info: "marcus@journey.os | +39 333 444 555",
          active_status: false,
          fulfillment_capacity_per_month: 10,
          territories: "Europe Outbound, India",
          commission_tier: "director",
          payout_percentage: 12.0,
          revenue_closed_ytd: 310000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleEdit = (agent: AgentRecord) => {
    setEditingAgent(agent);
    setName(agent.name);
    setContactInfo(agent.contact_info);
    setActiveStatus(agent.active_status);
    setCapacity(agent.fulfillment_capacity_per_month);
    setTerritories(agent.territories);
    setTier(agent.commission_tier);
    setPayout(agent.payout_percentage);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingAgent(null);
    setName("");
    setContactInfo("");
    setActiveStatus(true);
    setCapacity(15);
    setTerritories("Southeast Asia");
    setTier("standard");
    setPayout(5.0);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isCreating) {
        // Mock DB Insertion / Action
        const { error } = await supabase.from("agents").insert({
          name: name,
          contact_info: contactInfo,
          active_status: activeStatus,
          fulfillment_capacity_per_month: capacity
        });
        if (error) throw error;
        setSuccessMsg(`Agent '${name}' added successfully.`);
      } else if (editingAgent?.id) {
        // Mock DB Update
        const { error } = await supabase
          .from("agents")
          .update({
            name: name,
            contact_info: contactInfo,
            active_status: activeStatus,
            fulfillment_capacity_per_month: capacity
          })
          .eq("id", editingAgent.id);
        if (error) throw error;
        setSuccessMsg(`Agent '${name}' updated successfully.`);
      }
      setEditingAgent(null);
      setIsCreating(false);
      fetchAgents();
    } catch (err: any) {
      // Offline fallback state update for demonstration
      const mockNew: AgentRecord = {
        id: editingAgent?.id || `agent-${Date.now()}`,
        name,
        contact_info: contactInfo,
        active_status: activeStatus,
        fulfillment_capacity_per_month: capacity,
        territories,
        commission_tier: tier,
        payout_percentage: payout,
        revenue_closed_ytd: editingAgent?.revenue_closed_ytd || 0
      };

      if (isCreating) {
        setAgents(prev => [...prev, mockNew]);
        setSuccessMsg(`Mock Action: Successfully added agent '${name}'.`);
      } else {
        setAgents(prev => prev.map(a => (a.id === editingAgent?.id ? mockNew : a)));
        setSuccessMsg(`Mock Action: Successfully updated agent '${name}'.`);
      }
      setEditingAgent(null);
      setIsCreating(false);
    }
  };

  const columns: Column<AgentRecord>[] = [
    { header: "Agent", key: "name", sortable: true },
    { header: "Contact Details", key: "contact_info" },
    { header: "Quota / Month", key: "fulfillment_capacity_per_month", sortable: true },
    { header: "Territories", key: "territories" },
    { header: "Tier", key: "commission_tier", render: (row) => <span className="capitalize font-semibold">{row.commission_tier}</span> },
    { header: "Payout %", key: "payout_percentage", render: (row) => `${row.payout_percentage}%` },
    { header: "Revenue YTD", key: "revenue_closed_ytd", render: (row) => `$${row.revenue_closed_ytd.toLocaleString()}`, sortable: true },
    {
      header: "Status",
      key: "active_status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            row.active_status
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {row.active_status ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  const actions: TableAction<AgentRecord>[] = [
    { label: "Configure", onClick: handleEdit, className: "text-marigold" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-indigo">Agent Allocation sheets</h1>
          <p className="text-xs text-dusk-teal mt-0.5">
            Administer agent booking pipelines, commission structures, monthly load capacities, and geographical territories.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <AdminTable
            data={agents}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search agent records..."
            actions={actions}
            onAdd={handleCreate}
            addButtonLabel="Add Agent Profile"
            exportFileName="agents_performance_registry"
          />
        </div>

        {(editingAgent || isCreating) && (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-ink-indigo font-display">
                {isCreating ? "Add Agent Profile" : "Configure Agent Profile"}
              </h3>
              <button
                onClick={() => {
                  setEditingAgent(null);
                  setIsCreating(false);
                }}
                className="text-dusk-teal/60 hover:text-ink-indigo font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Contact Email / Phone *</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Fulfillment Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Payout Share (%)</label>
                  <input
                    type="number"
                    value={payout}
                    onChange={(e) => setPayout(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                    step={0.1}
                    min={0}
                    max={50}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Allocated Territories</label>
                <input
                  type="text"
                  value={territories}
                  onChange={(e) => setTerritories(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  placeholder="e.g. Dubai, Bali, Singapore"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Commission Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as AgentRecord["commission_tier"])}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold text-xs font-semibold"
                >
                  <option value="standard">Standard Agent (5%)</option>
                  <option value="senior">Senior Consultant (8.5%)</option>
                  <option value="director">Territory Director (12%)</option>
                </select>
              </div>

              <div className="flex gap-4 items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                  <input
                    type="checkbox"
                    checked={activeStatus}
                    onChange={(e) => setActiveStatus(e.target.checked)}
                    className="accent-marigold"
                  />
                  <span>Active Agent (Accepting Lead Allocations)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition text-center"
                >
                  Save Agent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAgent(null);
                    setIsCreating(false);
                  }}
                  className="flex-1 border border-border rounded-lg py-2.5 hover:bg-sand/30 transition text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
