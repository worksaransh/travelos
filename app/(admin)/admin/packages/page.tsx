"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { Plus, X, AlertTriangle, Layers, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PackageRow {
  id: string;
  name: string;
  destination_city: string;
  destination_city_id: string;
  duration_nights: number;
  package_tier: string;
  base_price: number;
  needs_owner_review: boolean;
  is_active: boolean;
  is_featured: boolean;
}

interface ComponentRow {
  id: string;
  component_type: string;
  experience_name: string;
  experience_id: string;
  price_delta: number;
}

export default function PackagesAdmin() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: string; name: string }[]>([]);
  const [experiencesList, setExperiencesList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPkg, setEditingPkg] = useState<PackageRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pkgComponents, setPkgComponents] = useState<ComponentRow[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Package Form Fields State
  const [formName, setFormName] = useState("");
  const [formCityId, setFormCityId] = useState("");
  const [formNights, setFormNights] = useState(5);
  const [formTier, setFormTier] = useState("comfort");
  const [formBasePrice, setFormBasePrice] = useState(82000);
  const [formReview, setFormReview] = useState(true);
  const [formActive, setFormActive] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  // Component Form States
  const [compType, setCompType] = useState("included_experience");
  const [compExpId, setCompExpId] = useState("");
  const [compPriceDelta, setCompPriceDelta] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get cities
      const { data: cities } = await supabase.from("cities").select("id, name").is("deleted_at", null);
      setCitiesList(cities || []);

      // 2. Get experiences
      const { data: exps } = await supabase.from("experiences").select("id, name").is("deleted_at", null);
      setExperiencesList(exps || []);

      // 3. Get packages
      const { data: pkgs, error: pkgErr } = await supabase
        .from("packages")
        .select(`
          id,
          name,
          destination_city_id,
          duration_nights,
          package_tier,
          base_price,
          needs_owner_review,
          is_active,
          is_featured,
          cities ( name )
        `)
        .is("deleted_at", null);

      if (pkgErr) throw pkgErr;

      const formatted: PackageRow[] = (pkgs || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        destination_city: p.cities?.name || "Singapore",
        destination_city_id: p.destination_city_id,
        duration_nights: Number(p.duration_nights || 0),
        package_tier: p.package_tier,
        base_price: Number(p.base_price || 0),
        needs_owner_review: !!p.needs_owner_review,
        is_active: !!p.is_active,
        is_featured: !!p.is_featured
      }));

      setPackages(formatted);
    } catch (err: any) {
      console.error("Failed to query package templates:", err);
      setErrorMsg("Failed loading package catalog.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from("package_components")
        .select(`
          id,
          component_type,
          experience_id,
          price_delta,
          experiences ( name )
        `)
        .eq("package_id", packageId);

      if (error) throw error;

      const formatted: ComponentRow[] = (data || []).map((c: any) => ({
        id: c.id,
        component_type: c.component_type,
        experience_name: c.experiences?.name || "Stay/Other Upgrade",
        experience_id: c.experience_id || "",
        price_delta: Number(c.price_delta || 0)
      }));

      setPkgComponents(formatted);
    } catch (err: any) {
      console.error("Failed loading package components:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row: PackageRow) => {
    setEditingPkg(row);
    setFormName(row.name);
    setFormCityId(row.destination_city_id);
    setFormNights(row.duration_nights);
    setFormTier(row.package_tier);
    setFormBasePrice(row.base_price);
    setFormReview(row.needs_owner_review);
    setFormActive(row.is_active);
    setFormFeatured(row.is_featured);
    setIsCreating(false);

    fetchComponents(row.id);
  };

  const handleCreateNew = () => {
    setEditingPkg(null);
    setFormName("");
    setFormCityId(citiesList[0]?.id || "");
    setFormNights(5);
    setFormTier("comfort");
    setFormBasePrice(80000);
    setFormReview(true);
    setFormActive(true);
    setFormFeatured(false);
    setPkgComponents([]);
    setIsCreating(true);
  };

  const handleSoftDelete = async (row: PackageRow) => {
    if (!confirm(`Are you sure you want to soft-delete package template '${row.name}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("packages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", row.id);

      if (error) throw error;
      setSuccessMsg(`Successfully deleted '${row.name}'.`);
      fetchData();
    } catch (err: any) {
      setErrorMsg(`Delete operation failed: ${err.message}`);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isCreating) {
        const { data: newPkg, error } = await supabase
          .from("packages")
          .insert({
            name: formName,
            destination_city_id: formCityId,
            duration_nights: formNights,
            package_tier: formTier,
            base_price: formBasePrice,
            needs_owner_review: formReview,
            is_active: formActive,
            is_featured: formFeatured
          })
          .select("id")
          .single();

        if (error) throw error;
        setSuccessMsg(`Package template '${formName}' created successfully.`);
        setEditingPkg({
          id: newPkg.id,
          name: formName,
          destination_city_id: formCityId,
          destination_city: citiesList.find(c => c.id === formCityId)?.name || "",
          duration_nights: formNights,
          package_tier: formTier,
          base_price: formBasePrice,
          needs_owner_review: formReview,
          is_active: formActive,
          is_featured: formFeatured
        });
        setIsCreating(false);
      } else if (editingPkg?.id) {
        const { error } = await supabase
          .from("packages")
          .update({
            name: formName,
            destination_city_id: formCityId,
            duration_nights: formNights,
            package_tier: formTier,
            base_price: formBasePrice,
            needs_owner_review: formReview,
            is_active: formActive,
            is_featured: formFeatured
          })
          .eq("id", editingPkg.id);

        if (error) throw error;
        setSuccessMsg(`Package template '${formName}' updated successfully.`);
      }

      fetchData();
    } catch (err: any) {
      setErrorMsg(`Save failed: ${err.message}`);
    }
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg?.id) return;

    try {
      const { error } = await supabase.from("package_components").insert({
        package_id: editingPkg.id,
        component_type: compType,
        experience_id: compExpId || null,
        price_delta: compPriceDelta
      });

      if (error) throw error;
      setSuccessMsg("Component linked successfully.");
      fetchComponents(editingPkg.id);

      // Reset form fields
      setCompExpId("");
      setCompPriceDelta(0);
    } catch (err: any) {
      setErrorMsg(`Failed adding component: ${err.message}`);
    }
  };

  const handleDeleteComponent = async (id: string) => {
    try {
      const { error } = await supabase.from("package_components").delete().eq("id", id);
      if (error) throw error;
      if (editingPkg) fetchComponents(editingPkg.id);
    } catch (err: any) {
      setErrorMsg(`Failed deleting component: ${err.message}`);
    }
  };

  const columns: Column<PackageRow>[] = [
    { header: "Name", key: "name", sortable: true },
    { header: "Destination", key: "destination_city", sortable: true },
    { header: "Nights", key: "duration_nights" },
    {
      header: "Tier",
      key: "package_tier",
      render: (row) => (
        <span className="font-mono uppercase text-[10px] bg-sand px-2 py-0.5 rounded border border-border/40 font-semibold">
          {row.package_tier}
        </span>
      )
    },
    {
      header: "Base Cost",
      key: "base_price",
      render: (row) => <span>₹{row.base_price.toLocaleString("en-IN")}</span>,
      sortable: true
    },
    {
      header: "Status",
      key: "is_active",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            row.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  const actions: TableAction<PackageRow>[] = [
    { label: "Configure", onClick: handleEdit, className: "text-marigold flex items-center gap-1" },
    { label: "Delete", onClick: handleSoftDelete, className: "text-clay-rose" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">Package Operations</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Configure customizable package blueprints, link signature stays, and manage addons.
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
            data={packages}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search packages..."
            actions={actions}
            onAdd={handleCreateNew}
            addButtonLabel="Add Package Template"
            exportFileName="packages_templates"
          />
        </div>

        {/* Edit Form side-panel */}
        {(editingPkg || isCreating) && (
          <div className="space-y-6 animate-fade-in">
            {/* Package details form */}
            <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <h3 className="text-sm font-bold text-ink-indigo font-display">
                  {isCreating ? "Create Package Template" : `Edit Package details`}
                </h3>
                <button
                  onClick={() => {
                    setEditingPkg(null);
                    setIsCreating(false);
                  }}
                  className="text-dusk-teal/60 hover:text-ink-indigo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Package Name *</label>
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
                    <label className="block font-semibold text-deep-charcoal mb-1">Duration (Nights) *</label>
                    <input
                      type="number"
                      value={formNights}
                      onChange={(e) => setFormNights(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">Package Tier *</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold"
                      required
                    >
                      <option value="comfort">Comfort</option>
                      <option value="premium">Premium</option>
                      <option value="signature">Signature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-deep-charcoal mb-1">Base Price (INR) *</label>
                    <input
                      type="number"
                      value={formBasePrice}
                      onChange={(e) => setFormBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none focus:border-marigold font-mono font-bold text-emerald-800"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border/20">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                    <input
                      type="checkbox"
                      checked={formReview}
                      onChange={(e) => setFormReview(e.target.checked)}
                      className="accent-marigold"
                    />
                    <span>Needs Owner Review Flag</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="accent-marigold"
                    />
                    <span>Is Active Blueprint</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-deep-charcoal">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="accent-marigold"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition"
                  >
                    Save Base Details
                  </Button>
                </div>
              </form>
            </div>

            {/* Package components linker */}
            {editingPkg?.id && (
              <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-border/20 pb-3">
                  <h3 className="text-sm font-bold text-ink-indigo font-display">
                    Package Components
                  </h3>
                  <span className="p-1 bg-sand text-dusk-teal rounded"><Layers className="w-4 h-4" /></span>
                </div>

                {/* List current components */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-semibold text-deep-charcoal">Linked Items:</h4>
                  {pkgComponents.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border/20 p-2.5 rounded-lg bg-sand/15">
                      {pkgComponents.map((c) => (
                        <div key={c.id} className="flex justify-between items-center text-[10px] pb-1.5 border-b border-border/10">
                          <div className="flex flex-col">
                            <span className="font-bold text-ink-indigo uppercase tracking-wide">
                              {c.component_type.replace("_", " ")}
                            </span>
                            <span className="text-dusk-teal truncate max-w-[150px]">
                              {c.experience_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-800">
                              {c.price_delta >= 0 ? "+" : ""}₹{c.price_delta.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => handleDeleteComponent(c.id)}
                              className="text-clay-rose hover:underline"
                            >
                              Unlink
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-dusk-teal/60 italic border border-border/20 rounded-lg">
                      No experiences or upgrades linked yet.
                    </div>
                  )}
                </div>

                {/* Add component form */}
                <form onSubmit={handleAddComponent} className="border-t border-border/20 pt-3 mt-4 space-y-3 text-xs">
                  <h4 className="font-semibold text-deep-charcoal">Link New Component:</h4>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-dusk-teal mb-1">Component Type</label>
                    <select
                      value={compType}
                      onChange={(e) => setCompType(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none"
                    >
                      <option value="included_experience">Included Experience</option>
                      <option value="hotel_upgrade">Hotel Upgrade</option>
                      <option value="addon_experience">Addon Experience</option>
                      <option value="extra_day">Extra Day extension</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-dusk-teal mb-1">Select Experience (Catalog lookup)</label>
                    <select
                      value={compExpId}
                      onChange={(e) => setCompExpId(e.target.value)}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none"
                    >
                      <option value="">None / Custom Stay Upgrade</option>
                      {experiencesList.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-dusk-teal mb-1">Price Delta (INR)</label>
                    <input
                      type="number"
                      value={compPriceDelta}
                      onChange={(e) => setCompPriceDelta(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border/60 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-ink-indigo hover:bg-ink-indigo/90 text-white rounded-lg py-2 font-semibold transition"
                  >
                    Link Component
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
