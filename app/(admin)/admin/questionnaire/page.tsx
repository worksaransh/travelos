"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { X, AlertTriangle, Layers, GripVertical, Plus, HelpCircle } from "lucide-react";
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

const questionTemplates = [
  {
    question_id: "duration",
    question_text: "How many days are you planning to travel?",
    type: "number",
    options: "3, 5, 7, 10, 14",
    condition_field: null,
    condition_op: null,
    condition_value: null,
    next_question_if_condition_true: null,
    next_question_default: "budget_pref"
  },
  {
    question_id: "budget_pref",
    question_text: "What is your budget category?",
    type: "select",
    options: "Budget, Standard, Luxury, Ultra-Luxury",
    condition_field: null,
    condition_op: null,
    condition_value: null,
    next_question_if_condition_true: null,
    next_question_default: "travel_pace"
  },
  {
    question_id: "travel_pace",
    question_text: "What is your preferred travel pace?",
    type: "select",
    options: "Relaxed, Moderate, Fast-paced",
    condition_field: null,
    condition_op: null,
    condition_value: null,
    next_question_if_condition_true: null,
    next_question_default: "interests"
  },
  {
    question_id: "interests",
    question_text: "What activities interest you most?",
    type: "multi-select",
    options: "Culture, Nature, Food, Adventure, Shopping, Nightlife",
    condition_field: null,
    condition_op: null,
    condition_value: null,
    next_question_if_condition_true: null,
    next_question_default: "dietary_restriction"
  },
  {
    question_id: "dietary_restriction",
    question_text: "Any dietary restrictions or preferences?",
    type: "text",
    options: "None, Vegetarian, Vegan, Halal, Gluten-Free",
    condition_field: null,
    condition_op: null,
    condition_value: null,
    next_question_if_condition_true: null,
    next_question_default: "finish"
  }
];

export default function QuestionnaireAdmin() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"builder" | "table">("builder");
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
    setFormTier(questions.length);
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

  const handleDelete = async (questionId: string) => {
    if (!confirm(`Are you sure you want to delete question node '${questionId}'?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase
        .from("questionnaire_flow")
        .delete()
        .eq("question_id", questionId);
      if (error) throw error;
      setSuccessMsg(`Question '${questionId}' deleted successfully.`);
      fetchQuestions();
    } catch (err: any) {
      setErrorMsg(`Delete failed: ${err.message}`);
    }
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

  // Drag and Drop reordering handlers
  const handleDragStartReorder = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "reorder", index }));
  };

  const handleDragStartTemplate = (e: React.DragEvent, template: typeof questionTemplates[0]) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "template", data: template }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateQuestionTiers = async (reorderedQuestions: QuestionRow[]) => {
    try {
      const updates = reorderedQuestions.map((q, index) => {
        return supabase
          .from("questionnaire_flow")
          .update({ tier: index })
          .eq("question_id", q.question_id);
      });
      await Promise.all(updates);
      setSuccessMsg("Question tiers successfully persisted in database.");
    } catch (err: any) {
      setErrorMsg("Failed to persist database tiers: " + err.message);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;
    try {
      const payload = JSON.parse(rawData);
      if (payload.type === "template") {
        const templateData = payload.data;
        // Verify if ID already exists
        const exists = questions.some(q => q.question_id === templateData.question_id);
        const finalId = exists ? `${templateData.question_id}_copy_${Date.now().toString().slice(-4)}` : templateData.question_id;

        const newQuestion = {
          ...templateData,
          question_id: finalId,
          tier: targetIndex
        };

        const { error } = await supabase.from("questionnaire_flow").insert(newQuestion);
        if (error) throw error;

        setSuccessMsg(`Added new question '${finalId}' from template.`);
        fetchQuestions();
      } else if (payload.type === "reorder") {
        const sourceIndex = payload.index;
        if (sourceIndex === targetIndex) return;

        const items = Array.from(questions);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, reorderedItem);

        // Optimistically set state
        setQuestions(items.map((it, idx) => ({ ...it, tier: idx })));
        await updateQuestionTiers(items);
        fetchQuestions();
      }
    } catch (err: any) {
      setErrorMsg("Drop operation failed: " + err.message);
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
    { label: "Configure", onClick: handleEdit, className: "text-marigold" },
    { label: "Delete", onClick: (row) => handleDelete(row.question_id), className: "text-clay-rose font-semibold" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Questionnaire Flow Manager</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Design conditional branching paths, options lists, and sequence tiers for the traveler questionnaire.
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

      {/* View Selector Toggle & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("builder")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              viewMode === "builder"
                ? "bg-marigold text-white shadow-sm"
                : "bg-white border border-border/40 text-dusk-teal hover:bg-sand/35"
            }`}
          >
            Interactive Flow Builder (Drag & Drop)
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              viewMode === "table"
                ? "bg-marigold text-white shadow-sm"
                : "bg-white border border-border/40 text-dusk-teal hover:bg-sand/35"
            }`}
          >
            Catalog Table View
          </button>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1 bg-ink-indigo hover:bg-ink-indigo/90 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5 text-marigold" />
          <span>Add Question Node</span>
        </button>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Drag-and-Drop View Layout */}
        {viewMode === "builder" ? (
          <>
            {/* Sidebar Templates Palette */}
            <div className="xl:col-span-1 bg-white border border-border/40 rounded-xl p-4 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-ink-indigo uppercase tracking-wider">Templates Palette</h3>
                <p className="text-[10px] text-dusk-teal mt-0.5">
                  Drag any card below and drop it into the main flow list to insert a new question node.
                </p>
              </div>
              <div className="space-y-2.5">
                {questionTemplates.map(tmpl => (
                  <div
                    key={tmpl.question_id}
                    draggable
                    onDragStart={(e) => handleDragStartTemplate(e, tmpl)}
                    className="p-3.5 bg-sand/30 border border-border/20 rounded-lg hover:border-marigold/40 transition cursor-grab active:cursor-grabbing text-xs group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[9px] font-bold text-marigold uppercase">
                        {tmpl.question_id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-dusk-teal/10 text-dusk-teal uppercase font-semibold">
                        {tmpl.type}
                      </span>
                    </div>
                    <p className="font-semibold text-ink-indigo group-hover:text-marigold transition-colors">
                      {tmpl.question_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Interactive Flow List */}
            <div className="xl:col-span-2 bg-white border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-ink-indigo uppercase tracking-wider">Questionnaire Hierarchy</h3>
                <p className="text-[10px] text-dusk-teal mt-0.5">
                  Drag and drop nodes to change sequence. Drop templates here to add new questions.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="border-2 border-dashed border-border/60 rounded-xl p-10 text-center text-xs text-dusk-teal">
                  <HelpCircle className="w-8 h-8 text-dusk-teal/40 mx-auto mb-2" />
                  <p>No questions defined. Drag templates here or add nodes manually.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div
                      key={q.question_id}
                      draggable
                      onDragStart={(e) => handleDragStartReorder(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="flex items-start gap-3.5 p-4 bg-white border border-border/40 rounded-xl shadow-sm hover:border-marigold/40 hover:shadow transition cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="text-dusk-teal/30 w-4 h-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-ink-indigo/10 text-ink-indigo rounded-full uppercase">
                            Tier {q.tier}
                          </span>
                          <span className="font-mono text-xs font-bold text-deep-charcoal">
                            ID: {q.question_id}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-semibold bg-sand border border-border/20 text-dusk-teal rounded-full capitalize">
                            {q.type}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-ink-indigo mt-1.5 break-words">
                          {q.question_text}
                        </p>
                        {q.options && (
                          <p className="text-[10px] text-dusk-teal mt-1">
                            <span className="font-semibold">Options:</span> {q.options}
                          </p>
                        )}
                        {q.next_question_default && (
                          <p className="text-[10px] text-dusk-teal mt-0.5">
                            <span className="font-semibold">Next Default:</span> <span className="font-mono text-[9px]">{q.next_question_default}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEdit(q)}
                          className="px-2 py-1 bg-marigold/10 text-marigold hover:bg-marigold/20 rounded text-[10px] font-bold transition"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => handleDelete(q.question_id)}
                          className="px-2 py-1 bg-clay-rose/10 text-clay-rose hover:bg-clay-rose/25 rounded text-[10px] font-bold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Table Catalog View Layout */
          <div className="xl:col-span-3 space-y-4">
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
        )}

        {/* Edit Form Side-Panel (Spans remaining column or overlay) */}
        {(editingQuestion || isCreating) && (
          <div className="xl:col-span-1 bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
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
                    max={100}
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
