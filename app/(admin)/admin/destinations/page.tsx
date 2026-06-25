"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { Plus, X, AlertTriangle } from "lucide-react";

interface DestinationRow {
  id: string;
  name: string;
  country_name: string;
  region: string;
  visa_policy_default: string;
  currency: string;
  avg_cost_index: number;
  supplier_coverage_status: string;
  domestic_flag: boolean;
  deleted_at: string | null;
}

export default function DestinationsAdmin() {
  const [destinations, setDestinations] = useState<DestinationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDest, setEditingDest] = useState<Partial<DestinationRow> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formCountry, setFormCountry] = useState("Singapore");
  const [formRegion, setFormRegion] = useState("Southeast Asia");
  const [formVisa, setFormVisa] = useState("E-Visa Required");
  const [formCurrency, setFormCurrency] = useState("SGD");
  const [formCost, setFormCost] = useState(72.5);
  const [formCoverage, setFormCoverage] = useState("active");
  const [formDomestic, setFormDomestic] = useState(false);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      // Query cities joined with countries
      const { data, error } = await supabase
        .from("cities")
        .select(`
          id,
          name,
          avg_cost_index,
          supplier_coverage_status,
          deleted_at,
          countries (
            name,
            region,
            visa_policy_default,
            currency,
            domestic_flag
          )
        `)
        .is("deleted_at", null);

      if (error) throw error;

      const formatted: DestinationRow[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        country_name: row.countries?.name || "",
        region: row.countries?.region || "",
        visa_policy_default: row.countries?.visa_policy_default || "",
        currency: row.countries?.currency || "",
        avg_cost_index: Number(row.avg_cost_index || 0),
        supplier_coverage_status: row.supplier_coverage_status || "none",
        domestic_flag: !!row.countries?.domestic_flag,
        deleted_at: row.deleted_at
      }));

      setDestinations(formatted);
    } catch (err: any) {
      console.error("Failed to load destinations:", err);
      setErrorMsg("Failed to query database destinations. Showing fallback.");
      // Fallback seed mock
      setDestinations([
        {
          id: "1",
          name: "Singapore",
          country_name: "Singapore",
          region: "Southeast Asia",
          visa_policy_default: "E-Visa Required",
          currency: "SGD",
          avg_cost_index: 72.5,
          supplier_coverage_status: "active",
          domestic_flag: false,
          deleted_at: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleEdit = (row: DestinationRow) => {
    setEditingDest(row);
    setFormName(row.name);
    setFormCountry(row.country_name);
    setFormRegion(row.region);
    setFormVisa(row.visa_policy_default);
    setFormCurrency(row.currency);
    setFormCost(row.avg_cost_index);
    setFormCoverage(row.supplier_coverage_status);
    setFormDomestic(row.domestic_flag);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingDest(null);
    setFormName("");
    setFormCountry("Singapore");
    setFormRegion("Southeast Asia");
    setFormVisa("E-Visa Required");
    setFormCurrency("SGD");
    setFormCost(50);
    setFormCoverage("active");
    setFormDomestic(false);
    setIsCreating(true);
  };

  const handleSoftDelete = async (row: DestinationRow) => {
    if (!confirm(`Are you sure you want to soft-delete destination '${row.name}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("cities")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", row.id);

      if (error) throw error;
      setSuccessMsg(`Successfully deleted '${row.name}'.`);
      fetchDestinations();
    } catch (err: any) {
      setErrorMsg(`Delete failed: ${err.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isCreating) {
        // Find or create country record first
        let countryId = "";
        const { data: countryData } = await supabase
          .from("countries")
          .select("id")
          .eq("name", formCountry)
          .maybeSingle();

        if (countryData?.id) {
          countryId = countryData.id;
        } else {
          const { data: newCountry, error: countryErr } = await supabase
            .from("countries")
            .insert({
              name: formCountry,
              region: formRegion,
              visa_policy_default: formVisa,
              currency: formCurrency,
              domestic_flag: formDomestic
            })
            .select("id")
            .single();

          if (countryErr) throw countryErr;
          countryId = newCountry.id;
        }

        // Insert new city
        const { error: cityErr } = await supabase.from("cities").insert({
          country_id: countryId,
          name: formName,
          avg_cost_index: formCost,
          supplier_coverage_status: formCoverage
        });

        if (cityErr) throw cityErr;
        setSuccessMsg(`Destination '${formName}' created successfully.`);
      } else if (editingDest?.id) {
        // Update city
        const { error: cityErr } = await supabase
          .from("cities")
          .update({
            name: formName,
            avg_cost_index: formCost,
            supplier_coverage_status: formCoverage
          })
          .eq("id", editingDest.id);

        if (cityErr) throw cityErr;
        setSuccessMsg(`Destination '${formName}' updated successfully.`);
      }

      setEditingDest(null);
      setIsCreating(false);
      fetchDestinations();
    } catch (err: any) {
      setErrorMsg(`Save operation failed: ${err.message}`);
    }
  };

  const columns: Column<DestinationRow>[] = [
    { header: "City", key: "name", sortable: true },
    { header: "Country", key: "country_name", sortable: true },
    { header: "Region", key: "region" },
    {
      header: "Visa Policy",
      key: "visa_policy_default",
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded bg-sand border border-border/40 font-mono text-[10px]">
          {row.visa_policy_default}
        </span>
      )
    },
    { header: "Currency", key: "currency" },
    { header: "Cost Index", key: "avg_cost_index", sortable: true },
    {
      header: "Coverage",
      key: "supplier_coverage_status",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            row.supplier_coverage_status === "active"
              ? "bg-emerald-100 text-emerald-800"
              : row.supplier_coverage_status === "limited"
              ? "bg-amber-100 text-amber-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {row.supplier_coverage_status}
        </span>
      )
    }
  ];

  const actions: TableAction<DestinationRow>[] = [
    { label: "Edit", onClick: handleEdit, className: "text-marigold" },
    { label: "Delete", onClick: handleSoftDelete, className: "text-clay-rose" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Destination Management</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Define catalog territories, country visa restrictions, and coverage bands.
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list left */}
        <div className="lg:col-span-2 space-y-4">
          <AdminTable
            data={destinations}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search destinations..."
            actions={actions}
            onAdd={handleCreateNew}
            addButtonLabel="Add Destination"
            exportFileName="destinations_catalog"
          />
        </div>

        {/* Edit Form side-panel */}
        {(editingDest || isCreating) && (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-ink-indigo font-display">
                {isCreating ? "Add Destination" : `Edit Destination`}
              </h3>
              <button
                onClick={() => {
                  setEditingDest(null);
                  setIsCreating(false);
                }}
                className="text-dusk-teal/60 hover:text-ink-indigo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">City Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Country Name *</label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Geographic Region</label>
                <input
                  type="text"
                  value={formRegion}
                  onChange={(e) => setFormRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Visa Requirement</label>
                <input
                  type="text"
                  value={formVisa}
                  onChange={(e) => setFormVisa(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Cost Index (1-100)</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                  <input
                    type="checkbox"
                    checked={formDomestic}
                    onChange={(e) => setFormDomestic(e.target.checked)}
                    className="accent-marigold"
                  />
                  <span>Domestic Destination</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Supplier Coverage</label>
                <select
                  value={formCoverage}
                  onChange={(e) => setFormCoverage(e.target.value)}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold"
                >
                  <option value="active">Active</option>
                  <option value="limited">Limited</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition text-center"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDest(null);
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
