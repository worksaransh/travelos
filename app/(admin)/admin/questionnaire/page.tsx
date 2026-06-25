"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { X, AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionRow {
  question_id: string;
  tier: number;
  question_text: string;
  type: string;
  options: string;
  condition_field: string | null;
  condition_op: string | null;
  condition_value: string | null;
  next_question_if_condition_true: string | null;
  next_question_default: string | null;
}

export default function QuestionnaireAdmin() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields State
  const [formId, setFormId] = useState("");
  const [formTier, setFormTier] = useState(0);
  const [formText, setFormText] = useState("");
  const [formType, setFormType] = useState("select");
  const [formOptions, setFormOptions] = useState("");
  const [formCondField, setFormCondField] = useState("");
  const [formCondOp, setFormCondOp] = useState("");
  const [formCondVal, setFormCondVal] = useState("");
  const [formNextTrue, setFormNextTrue] = useState("");
  const [formNextDefault, setFormNextDefault] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("questionnaire_flow")
        .select("*")
        .order("tier", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err: any) {
      console.error("Failed to query questionnaire flow database:", err);
      setErrorMsg("Failed loading questionnaire database flow. Showing mock fallbacks.");
      // Fallback mocks
      setQuestions([
        {
          question_id: "occasion",
          tier: 0,
          question_text: "What is the occasion for your trip?",
          type: "select",
          options: "Vacation, Honeymoon, Anniversary, Business",
          condition_field: null,
          condition_op: null,
          condition_value: null,
          next_question_if_condition_true: null,
          next_question_default: "group_type"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEdit = (row: QuestionRow) => {
    setEditingQuestion(row);
    setFormId(row.question_id);
    setFormTier(row.tier);
    setFormText(row.question_text);
    setFormType(row.type);
    setFormOptions(row.options || "");
    setFormCondField(row.condition_field || "");
    setFormCondOp(row.condition_op || "");
    setFormCondVal(row.condition_value || "");
    setFormNextTrue(row.next_question_if_condition_true || "");
    setFormNextDefault(row.next_question_default || "");
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingQuestion(null);
    setFormId("");
    setFormTier(0);
    setFormText("");
    setFormType("select");
    setFormOptions("");
    setFormCondField("");
    setFormCondOp("");
    setFormCondVal("");
    setFormNextTrue("");
    setFormNextDefault("");
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        question_id: formId,
        tier: formTier,
        question_text: formText,
        type: formType,
        options: formOptions,
        condition_field: formCondField || null,
        condition_op: formCondOp || null,
        condition_value: formCondVal || null,
        next_question_if_condition_true: formNextTrue || null,
        next_question_default: formNextDefault || null
      };

      if (isCreating) {
        const { error } = await supabase.from("questionnaire_flow").insert(payload);
        if (error) throw error;
        setSuccessMsg(`Question '${formId}' created successfully.`);
      } else {
        const { error } = await supabase
          .from("questionnaire_flow")
          .update(payload)
          .eq("question_id", formId);
        if (error) throw error;
        setSuccessMsg(`Question '${formId}' updated successfully.`);
      }

      setEditingQuestion(null);
      setIsCreating(false);
      fetchQuestions();
    } catch (err: any) {
      setErrorMsg(`Save failed: ${err.message}`);
    }
  };

  const columns: Column<QuestionRow>[] = [
    { header: "ID", key: "question_id", sortable: true },
    { header: "Tier", key: "tier", sortable: true },
    { header: "Question Text", key: "question_text" },
    { header: "Type", key: "type" },
    {
      header: "Default Next",
      key: "next_question_default",
      render: (row) => <span className="font-mono text-[10px]">{row.next_question_default}</span>
    }
  ];

  const actions: TableAction<QuestionRow>[] = [
    { label: "Configure Branching", onClick: handleEdit, className: "text-marigold" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Questionnaire Flow Manager</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Design conditional branching paths, options lists, and node connections for the traveler questionnaire.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-clay-rose/10 border border-clay-rose/20 text-clay-rose text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Editor Panel Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table list left */}
        <div className="xl:col-span-2 space-y-4">
          <AdminTable
            data={questions}
            columns={columns}
            searchKey="question_id"
            searchPlaceholder="Search question node ID..."
            actions={actions}
            onAdd={handleCreateNew}
            addButtonLabel="Add Question Node"
            exportFileName="questionnaire_flow_blueprints"
          />
        </div>

        {/* Edit Form side-panel */}
        {(editingQuestion || isCreating) && (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-ink-indigo font-display">
                {isCreating ? "Add Question Node" : `Configure Branching Node`}
              </h3>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsCreating(false);
                }}
                className="text-dusk-teal/60 hover:text-ink-indigo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Question ID (Unique) *</label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={!isCreating}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono disabled:bg-sand/30"
                    placeholder="occasion"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Tier *</label>
                  <input
                    type="number"
                    value={formTier}
                    onChange={(e) => setFormTier(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono"
                    min={0}
                    max={5}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Question Text *</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white"
                  >
                    <option value="select">Select Menu</option>
                    <option value="multi-select">Checkbox (Multi)</option>
                    <option value="sliders">Sliders Grid</option>
                    <option value="number">Number input</option>
                    <option value="text">Text input</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Default Next Node</label>
                  <input
                    type="text"
                    value={formNextDefault}
                    onChange={(e) => setFormNextDefault(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none font-mono"
                    placeholder="destination"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Answer Options (Comma separated)</label>
                <input
                  type="text"
                  value={formOptions}
                  onChange={(e) => setFormOptions(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none"
                  placeholder="Vacation, Business, Honeymoon"
                />
              </div>

              {/* Conditional Skip logic */}
              <div className="border-t border-border/20 pt-3 mt-4 space-y-3">
                <h4 className="font-bold text-ink-indigo font-display flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-marigold" />
                  <span>Conditional Branching Skip Rules</span>
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-dusk-teal mb-1">Check Field</label>
                    <input
                      type="text"
                      value={formCondField}
                      onChange={(e) => setFormCondField(e.target.value)}
                      className="w-full px-2 py-1.5 border border-border/60 rounded-lg font-mono"
                      placeholder="occasion"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-dusk-teal mb-1">Operator</label>
                    <select
                      value={formCondOp}
                      onChange={(e) => setFormCondOp(e.target.value)}
                      className="w-full px-2 py-1.5 border border-border/60 rounded-lg bg-white font-mono"
                    >
                      <option value="">None</option>
                      <option value="eq">EQUALS</option>
                      <option value="neq">NOT EQUALS</option>
                      <option value="gt">GREATER THAN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-dusk-teal mb-1">Check Value</label>
                    <input
                      type="text"
                      value={formCondVal}
                      onChange={(e) => setFormCondVal(e.target.value)}
                      className="w-full px-2 py-1.5 border border-border/60 rounded-lg font-mono"
                      placeholder="Business"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-deep-charcoal mb-1">
                    Route to this Question ID if condition evaluates true:
                  </label>
                  <input
                    type="text"
                    value={formNextTrue}
                    onChange={(e) => setFormNextTrue(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none font-mono"
                    placeholder="agent_alert"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/20">
                <Button
                  type="submit"
                  className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition"
                >
                  Save Branching Node
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsCreating(false);
                  }}
                  variant="outline"
                  className="flex-1 border-border rounded-lg py-2.5"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
