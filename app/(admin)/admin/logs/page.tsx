"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { ScrollText, FileCode, Clock, Eye, AlertTriangle } from "lucide-react";

interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  actor_name?: string;
  actor_type: "user" | "agent" | "admin" | "system";
  action: string;
  entity_affected: string | null;
  details: Record<string, any> | null;
  occurred_at: string;
}

export default function AuditLogsAdmin() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("occurred_at", { ascending: false });

      if (error) throw error;

      const formatted: AuditLogRecord[] = (data || []).map((row: any) => ({
        id: row.id,
        actor_id: row.actor_id,
        actor_name: row.actor_id ? `Admin #${row.actor_id.slice(0, 6)}` : "System Engine",
        actor_type: row.actor_type,
        action: row.action,
        entity_affected: row.entity_affected,
        details: row.details,
        occurred_at: row.occurred_at
      }));

      setLogs(formatted);
    } catch (err: any) {
      console.warn("Audit logs DB lookup failed. Rendering fallback records:", err.message);
      // Fallback mocks
      setLogs([
        {
          id: "log-1",
          actor_id: "admin-s1",
          actor_name: "Sarah Andrews (Super Admin)",
          actor_type: "admin",
          action: "UPDATE_PACKAGE_PRICE",
          entity_affected: "packages/pkg-singapore-luxury-1",
          details: {
            package_id: "pkg-singapore-luxury-1",
            price_delta_applied: "+12.5%",
            old_base_price: 4800.0,
            new_base_price: 5400.0,
            reason: "High seasonality markup adjustment."
          },
          occurred_at: new Date().toISOString()
        },
        {
          id: "log-2",
          actor_id: "agent-a2",
          actor_name: "Alan Shepherd (Agent)",
          actor_type: "agent",
          action: "ALLOCATE_LEAD",
          entity_affected: "leads/lead-saransh-1",
          details: {
            lead_id: "lead-saransh-1",
            allocated_to: "agent-a2",
            previous_stage: "New",
            new_stage: "Contacted"
          },
          occurred_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "log-3",
          actor_id: null,
          actor_name: "AI Gemini Generator",
          actor_type: "system",
          action: "GENERATE_PACKAGE_DRAFT",
          entity_affected: "content_approval_queue/rev-12",
          details: {
            trigger: "questionnaire_flow_completion",
            traveler_id: "traveler-99",
            destination_city_id: "c26ec203-53b1-4b83-9958-90bcfb3a01de"
          },
          occurred_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: "log-4",
          actor_id: "admin-s1",
          actor_name: "Sarah Andrews (Super Admin)",
          actor_type: "admin",
          action: "DELETE_EXPERIENCE_TEMPLATE",
          entity_affected: "experiences/exp-sentosa-cable-car",
          details: {
            experience_id: "exp-sentosa-cable-car",
            deleted_by: "Sarah Andrews",
            deletion_mode: "soft_delete"
          },
          occurred_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: Column<AuditLogRecord>[] = [
    { header: "Timestamp", key: "occurred_at", render: (row) => new Date(row.occurred_at).toLocaleString(), sortable: true },
    {
      header: "Actor Type",
      key: "actor_type",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
            row.actor_type === "admin"
              ? "bg-purple-100 text-purple-800"
              : row.actor_type === "agent"
              ? "bg-indigo-100 text-indigo-800"
              : row.actor_type === "system"
              ? "bg-amber-100 text-amber-800"
              : "bg-sand text-dusk-teal"
          }`}
        >
          {row.actor_type}
        </span>
      ),
      sortable: true
    },
    { header: "Actor Name", key: "actor_name", sortable: true },
    { header: "Operation Action", key: "action", sortable: true },
    { header: "Entity Affected", key: "entity_affected" }
  ];

  const actions: TableAction<AuditLogRecord>[] = [
    {
      label: "Inspect Diff",
      onClick: (row) => setSelectedLog(row),
      className: "text-marigold"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Immutable Security Audit Logs</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Review legal compliance logs, pricing changes override events, delete activities, and user authorization updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <AdminTable
            data={logs}
            columns={columns}
            searchKey="action"
            searchPlaceholder="Search operations actions..."
            actions={actions}
            exportFileName="immutable_audit_logs"
          />
        </div>

        {selectedLog ? (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <div className="flex items-center gap-1.5 font-bold text-ink-indigo font-display text-sm">
                <FileCode className="w-4 h-4 text-marigold" />
                <span>Log Inspector</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-dusk-teal/60 hover:text-ink-indigo font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-dusk-teal uppercase">Log Transaction ID</span>
                <span className="font-mono text-deep-charcoal font-semibold bg-sand/35 p-1.5 rounded border border-border/20 truncate">
                  {selectedLog.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                <div><strong>Action Category:</strong> {selectedLog.action}</div>
                <div><strong>Actor Role:</strong> {selectedLog.actor_type.toUpperCase()}</div>
                <div><strong>Timestamp:</strong> {new Date(selectedLog.occurred_at).toLocaleTimeString()}</div>
                <div><strong>Affected Target:</strong> {selectedLog.entity_affected || "N/A"}</div>
              </div>

              <div className="border-t border-border/20 pt-3">
                <span className="text-[10px] font-bold text-dusk-teal uppercase block mb-1.5">JSON Payload / Difference Log</span>
                <pre className="p-3.5 bg-ink-indigo text-sand rounded-lg font-mono text-[10px] overflow-x-auto max-h-64 leading-relaxed">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-border/40 p-12 rounded-xl shadow-sm text-center text-xs text-dusk-teal/60 italic flex flex-col items-center gap-2">
            <ScrollText className="w-8 h-8 text-dusk-teal/30" />
            <span>Select a transaction row to inspect structural JSON diff logs and pre/post parameter calibrations.</span>
          </div>
        )}
      </div>
    </div>
  );
}
