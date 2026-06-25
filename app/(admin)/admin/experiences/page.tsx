"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { Plus, X, AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExperienceRow {
  id: string;
  name: string;
  city_name: string;
  category: string;
  price_band: string;
  duration_hours: number;
  is_signature_experience: boolean;
  supplier_bookable_flag: boolean;
  dimensions: Record<string, number>; // dimension name -> score weight
}

export default function ExperiencesAdmin() {
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: string; name: string }[]>([]);
  const [dimensionTags, setDimensionTags] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExp, setEditingExp] = useState<ExperienceRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formCityId, setFormCityId] = useState("");
  const [formCategory, setFormCategory] = useState("Attractions");
  const [formPriceBand, setFormPriceBand] = useState("medium");
  const [formDuration, setFormDuration] = useState(2);
  const [formSignature, setFormSignature] = useState(false);
  const [formBookable, setFormBookable] = useState(true);
  const [formDimensionWeights, setFormDimensionWeights] = useState<Record<string, number>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get dimension tags
      const { data: tags, error: tagsErr } = await supabase.from("dimension_tags").select("id, dimension_name");
      if (tagsErr) throw tagsErr;
      const formattedTags = (tags || []).map((t: any) => ({ id: t.id, name: t.dimension_name }));
      setDimensionTags(formattedTags);

      // 2. Get cities list
      const { data: cities, error: citiesErr } = await supabase.from("cities").select("id, name").is("deleted_at", null);
      if (citiesErr) throw citiesErr;
      setCitiesList(cities || []);

      // 3. Get experiences
      const { data: exps, error: expsErr } = await supabase
        .from("experiences")
        .select(`
          id,
          name,
          category,
          price_band,
          duration_hours,
          is_signature_experience,
          supplier_bookable_flag,
          cities ( name )
        `)
        .is("deleted_at", null);
      
      if (expsErr) throw expsErr;

      // 4. Get experience dimension weights
      const { data: weights, error: weightsErr } = await supabase.from("experience_dimension_tags").select("*");
      if (weightsErr) throw weightsErr;

      // Map weights by experience_id
      const weightMap: Record<string, Record<string, number>> = {};
      weights?.forEach((w: any) => {
        if (!weightMap[w.experience_id]) weightMap[w.experience_id] = {};
        const tagName = formattedTags.find(t => t.id === w.dimension_tag_id)?.name;
        if (tagName) {
          weightMap[w.experience_id][tagName] = Number(w.weight);
        }
      });

      const formattedExps: ExperienceRow[] = (exps || []).map((e: any) => {
        const expWeights: Record<string, number> = {};
        formattedTags.forEach(t => {
          expWeights[t.name] = weightMap[e.id]?.[t.name] || 0;
        });

        return {
          id: e.id,
          name: e.name,
          city_name: e.cities?.name || "Singapore",
          category: e.category || "General",
          price_band: e.price_band || "medium",
          duration_hours: Number(e.duration_hours || 0),
          is_signature_experience: !!e.is_signature_experience,
          supplier_bookable_flag: !!e.supplier_bookable_flag,
          dimensions: expWeights
        };
      });

      setExperiences(formattedExps);
    } catch (err: any) {
      console.error("Failed fetching experiences data:", err);
      setErrorMsg("Failed loading experience database catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row: ExperienceRow) => {
    setEditingExp(row);
    setFormName(row.name);
    
    const matchingCity = citiesList.find(c => c.name === row.city_name);
    setFormCityId(matchingCity?.id || citiesList[0]?.id || "");
    setFormCategory(row.category);
    setFormPriceBand(row.price_band);
    setFormDuration(row.duration_hours);
    setFormSignature(row.is_signature_experience);
    setFormBookable(row.supplier_bookable_flag);

    // Copy dimension weights
    const weightsCopy = { ...row.dimensions };
    setFormDimensionWeights(weightsCopy);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingExp(null);
    setFormName("");
    setFormCityId(citiesList[0]?.id || "");
    setFormCategory("Attractions");
    setFormPriceBand("medium");
    setFormDuration(2);
    setFormSignature(false);
    setFormBookable(true);

    const initialWeights: Record<string, number> = {};
    dimensionTags.forEach(t => {
      initialWeights[t.name] = 50; // default 50%
    });
    setFormDimensionWeights(initialWeights);
    setIsCreating(true);
  };

  const handleSoftDelete = async (row: ExperienceRow) => {
    if (!confirm(`Are you sure you want to soft-delete experience '${row.name}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("experiences")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", row.id);

      if (error) throw error;
      setSuccessMsg(`Successfully deleted '${row.name}'.`);
      fetchData();
    } catch (err: any) {
      setErrorMsg(`Failed delete: ${err.message}`);
    }
  };

  const handleWeightChange = (dimName: string, val: number) => {
    setFormDimensionWeights(prev => ({
      ...prev,
      [dimName]: val
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let expId = editingExp?.id || "";

      if (isCreating) {
        // Create new experience
        const { data: newExp, error: expErr } = await supabase
          .from("experiences")
          .insert({
            city_id: formCityId,
            name: formName,
            category: formCategory,
            price_band: formPriceBand,
            duration_hours: formDuration,
            is_signature_experience: formSignature,
            supplier_bookable_flag: formBookable
          })
          .select("id")
          .single();

        if (expErr) throw expErr;
        expId = newExp.id;
      } else {
        // Update experience
        const { error: expErr } = await supabase
          .from("experiences")
          .update({
            city_id: formCityId,
            name: formName,
            category: formCategory,
            price_band: formPriceBand,
            duration_hours: formDuration,
            is_signature_experience: formSignature,
            supplier_bookable_flag: formBookable
          })
          .eq("id", expId);

        if (expErr) throw expErr;
      }

      // Upsert dimension weights for this experience
      for (const tag of dimensionTags) {
        const weightValue = formDimensionWeights[tag.name] || 0;
        const { error: weightErr } = await supabase
          .from("experience_dimension_tags")
          .upsert({
            experience_id: expId,
            dimension_tag_id: tag.id,
            weight: weightValue
          }, { onConflict: "experience_id,dimension_tag_id" });

        if (weightErr) throw weightErr;
      }

      setSuccessMsg(`Experience '${formName}' saved successfully.`);
      setEditingExp(null);
      setIsCreating(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(`Save failed: ${err.message}`);
    }
  };

  const columns: Column<ExperienceRow>[] = [
    { header: "Name", key: "name", sortable: true },
    { header: "City", key: "city_name", sortable: true },
    { header: "Category", key: "category" },
    {
      header: "Price Band",
      key: "price_band",
      render: (row) => (
        <span className="font-mono text-[10px] uppercase font-semibold text-dusk-teal">
          {row.price_band}
        </span>
      )
    },
    { header: "Duration (hrs)", key: "duration_hours", sortable: true },
    {
      header: "Bookable",
      key: "supplier_bookable_flag",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
            row.supplier_bookable_flag
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {row.supplier_bookable_flag ? "YES" : "NO"}
        </span>
      )
    }
  ];

  const actions: TableAction<ExperienceRow>[] = [
    { label: "Configure", onClick: handleEdit, className: "text-marigold flex items-center gap-1" },
    { label: "Delete", onClick: handleSoftDelete, className: "text-clay-rose" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Experience Management</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Map specific destination attractions and calibrate their scoring weights across the 10 dimensions.
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
            data={experiences}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search experiences..."
            actions={actions}
            onAdd={handleCreateNew}
            addButtonLabel="Add Experience"
            exportFileName="experiences_catalog"
          />
        </div>

        {/* Edit Form side-panel */}
        {(editingExp || isCreating) && (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-ink-indigo font-display">
                {isCreating ? "Add Experience" : `Configure Experience`}
              </h3>
              <button
                onClick={() => {
                  setEditingExp(null);
                  setIsCreating(false);
                }}
                className="text-dusk-teal/60 hover:text-ink-indigo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Experience Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Destination City *</label>
                  <select
                    value={formCityId}
                    onChange={(e) => setFormCityId(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold"
                    required
                  >
                    <option value="">Select City</option>
                    {citiesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Price Band</label>
                  <select
                    value={formPriceBand}
                    onChange={(e) => setFormPriceBand(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                  <input
                    type="checkbox"
                    checked={formSignature}
                    onChange={(e) => setFormSignature(e.target.checked)}
                    className="accent-marigold"
                  />
                  <span>Signature Experience</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                  <input
                    type="checkbox"
                    checked={formBookable}
                    onChange={(e) => setFormBookable(e.target.checked)}
                    className="accent-marigold"
                  />
                  <span>Supplier Bookable</span>
                </label>
              </div>

              {/* Vector Matching Dimensions Calibrator */}
              <div className="border-t border-border/20 pt-3 mt-4 space-y-3">
                <h4 className="font-bold text-ink-indigo font-display">Vector Profile Calibration</h4>
                <p className="text-[10px] text-dusk-teal">
                  Adjust dimensions weights score (0-100%) mapped for this experience.
                </p>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {dimensionTags.map((tag) => {
                    const weightVal = formDimensionWeights[tag.name] || 0;
                    return (
                      <div key={tag.id} className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-semibold text-[10px] text-deep-charcoal">
                          <span>{tag.name}</span>
                          <span className="font-mono text-marigold">{weightVal}%</span>
                        </div>
                        <input
                          type="range"
                          value={weightVal}
                          onChange={(e) => handleWeightChange(tag.name, Number(e.target.value))}
                          className="w-full accent-marigold"
                          min={0}
                          max={100}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/20">
                <Button
                  type="submit"
                  className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition"
                >
                  Save Catalog
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setEditingExp(null);
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
