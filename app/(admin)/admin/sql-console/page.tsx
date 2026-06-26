"use client";

import React, { useState } from "react";
import { 
  Database, 
  Terminal, 
  Play, 
  Table, 
  AlertCircle, 
  Download, 
  ChevronRight, 
  ChevronDown, 
  FileSpreadsheet,
  Clock
} from "lucide-react";

interface TableMetadata {
  name: string;
  columns: { name: string; type: string }[];
}

const dbSchema: TableMetadata[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "name", type: "text" },
      { name: "phone", type: "text (unique)" },
      { name: "email", type: "text (unique)" },
      { name: "lifecycle_stage", type: "text" },
      { name: "consent_status", type: "text" },
      { name: "current_dna_profile_id", type: "uuid" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "leads",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "user_id", type: "uuid (FK)" },
      { name: "capture_gate", type: "text" },
      { name: "whatsapp_number", type: "text" },
      { name: "email", type: "text" },
      { name: "name", type: "text" },
      { name: "preferred_contact_time", type: "text" },
      { name: "consent_given", type: "boolean" },
      { name: "consent_timestamp", type: "timestamptz" },
      { name: "stage", type: "text" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "itineraries",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "user_id", type: "uuid (FK)" },
      { name: "dna_snapshot_id", type: "uuid (FK)" },
      { name: "destination_city_id", type: "uuid (FK)" },
      { name: "status", type: "text" },
      { name: "package_tier", type: "text" },
      { name: "total_price_estimate", type: "numeric" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "experiences",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "city_id", type: "uuid (FK)" },
      { name: "name", type: "text" },
      { name: "category", type: "text" },
      { name: "price_band", type: "text" },
      { name: "is_signature_experience", type: "boolean" },
      { name: "popularity_score", type: "integer" },
      { name: "supplier_bookable_flag", type: "boolean" },
      { name: "embedding", type: "vector(1536)" }
    ]
  },
  {
    name: "cities",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "country_id", type: "uuid (FK)" },
      { name: "name", type: "text" },
      { name: "avg_cost_index", type: "numeric" },
      { name: "supplier_coverage_status", type: "text" }
    ]
  },
  {
    name: "packages",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "name", type: "text" },
      { name: "destination", type: "text" },
      { name: "tier", type: "text" },
      { name: "base_price", type: "numeric" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "questionnaire_flow",
    columns: [
      { name: "question_id", type: "text (PK)" },
      { name: "tier", type: "integer" },
      { name: "question_text", type: "text" },
      { name: "type", type: "text" },
      { name: "options", type: "text" },
      { name: "condition_field", type: "text" },
      { name: "condition_op", type: "text" },
      { name: "condition_value", type: "text" },
      { name: "next_question_if_condition_true", type: "text" },
      { name: "next_question_default", type: "text" }
    ]
  },
  {
    name: "validation_reports_cache",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "payload_hash", type: "text (unique)" },
      { name: "validation_report", type: "jsonb" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "crm_notification_logs",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "lead_id", type: "uuid (FK)" },
      { name: "message_body", type: "text" },
      { name: "status", type: "text" },
      { name: "created_at", type: "timestamptz" }
    ]
  }
];

const sampleQueries = [
  { label: "List Lead Statuses", sql: "SELECT id, name, email, stage, capture_gate FROM leads LIMIT 10;" },
  { label: "High price experiences", sql: "SELECT id, name, category, price_band FROM experiences WHERE price_band = 'high' LIMIT 5;" },
  { label: "Quiz Questions", sql: "SELECT question_id, tier, question_text, type FROM questionnaire_flow ORDER BY tier ASC;" },
  { label: "Recent CRM Alerts", sql: "SELECT id, message_body, status, created_at FROM crm_notification_logs ORDER BY created_at DESC LIMIT 5;" }
];

export default function SqlConsoleAdmin() {
  const [query, setQuery] = useState("SELECT * FROM experiences LIMIT 5;");
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    experiences: true
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const handleExecute = async () => {
    setExecuting(true);
    setErrorMsg("");
    setSuccessMsg("");
    setResults([]);
    setQueryTime(null);

    const startTime = performance.now();
    try {
      const res = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const endTime = performance.now();
      setQueryTime(Math.round(endTime - startTime));

      if (data.success) {
        setResults(data.rows);
        setSuccessMsg(`Query executed successfully. Returned ${data.rows.length} rows.`);
      } else {
        setErrorMsg(data.error || "Query failed to execute.");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const exportCSV = () => {
    if (results.length === 0) return;
    const headers = Object.keys(results[0]);
    const csvRows = [
      headers.join(","),
      ...results.map(row => 
        headers.map(header => {
          const val = row[header];
          const escaped = val !== null && val !== undefined ? String(val).replace(/"/g, '""') : "";
          return `"${escaped}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `query_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract columns dynamically from query results
  const resultColumns = results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">SQL Query Console</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Read-only access to view and analyze database tables structure directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Schema Explorer Sidebar */}
        <div className="lg:col-span-1 bg-white border border-border/40 rounded-xl p-4 shadow-sm space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-border/20 pb-3">
            <Database className="w-4 h-4 text-marigold" />
            <h3 className="text-xs font-bold text-ink-indigo uppercase tracking-wider">Schema Browser</h3>
          </div>

          <div className="space-y-2">
            {dbSchema.map(tbl => {
              const isExpanded = expandedTables[tbl.name];
              return (
                <div key={tbl.name} className="space-y-1">
                  <button
                    onClick={() => toggleTable(tbl.name)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-deep-charcoal hover:bg-sand/35 px-2 py-1.5 rounded transition text-left"
                  >
                    <span className="font-mono text-ink-indigo">{tbl.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-dusk-teal" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-dusk-teal" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="pl-4 pr-1 space-y-1 py-1 border-l border-border/40 ml-2 animate-fade-in">
                      {tbl.columns.map(col => (
                        <div key={col.name} className="flex justify-between items-center text-[10px] py-0.5 font-mono">
                          <span className="text-deep-charcoal font-semibold">{col.name}</span>
                          <span className="text-dusk-teal/80 italic">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Query Workspace & Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Query Inputs Card */}
          <div className="bg-white border border-border/40 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-marigold" />
                <h3 className="text-xs font-bold text-ink-indigo uppercase tracking-wider">SQL Query Workspace</h3>
              </div>
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(q.sql)}
                    className="px-2 py-1 bg-sand/40 border border-border/20 rounded hover:bg-marigold/10 hover:text-marigold transition text-[9px] font-mono text-dusk-teal"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative font-mono text-xs">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-32 p-3 bg-deep-charcoal text-sand rounded-xl border border-border/60 focus:outline-none focus:border-marigold resize-y shadow-inner font-mono leading-relaxed"
                placeholder="SELECT * FROM users LIMIT 10;"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleExecute}
                disabled={executing}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition shadow-sm ${
                  executing
                    ? "bg-marigold/50 cursor-not-allowed"
                    : "bg-marigold hover:bg-marigold/90"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{executing ? "Executing Query..." : "Run Query"}</span>
              </button>

              {queryTime !== null && (
                <div className="flex items-center gap-1 text-[10px] text-dusk-teal font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Query completed in {queryTime}ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Results Display */}
          {errorMsg && (
            <div className="p-3.5 bg-clay-rose/10 border border-clay-rose/20 text-clay-rose text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
              <span>{successMsg}</span>
              {results.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[10px] font-bold rounded-md transition shadow-xs"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          )}

          {/* Results Grid Table */}
          {results.length > 0 && (
            <div className="bg-white border border-border/40 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 border-b border-border/10 pb-2 mb-2">
                <Table className="w-4 h-4 text-dusk-teal" />
                <h3 className="text-xs font-bold text-ink-indigo uppercase tracking-wider">Results Explorer</h3>
              </div>

              <div className="overflow-x-auto max-h-[45vh] border border-border/20 rounded-lg">
                <table className="min-w-full divide-y divide-border/25">
                  <thead className="bg-sand/30 font-mono text-[10px] text-ink-indigo">
                    <tr>
                      {resultColumns.map(col => (
                        <th 
                          key={col} 
                          className="px-4 py-2 text-left font-bold uppercase tracking-wider border-b border-border/20"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border/15 font-mono text-xs">
                    {results.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sand/15 transition-colors">
                        {resultColumns.map(col => {
                          const val = row[col];
                          let rendered = "";
                          if (val === null || val === undefined) {
                            rendered = "NULL";
                          } else if (typeof val === "object") {
                            rendered = JSON.stringify(val);
                          } else {
                            rendered = String(val);
                          }
                          return (
                            <td 
                              key={col} 
                              className={`px-4 py-2.5 truncate max-w-[240px] border-b border-border/15 ${
                                val === null ? "text-dusk-teal/40 italic" : "text-deep-charcoal"
                              }`}
                              title={rendered}
                            >
                              {rendered}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
